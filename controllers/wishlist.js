const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads');  
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });


router.get('/new', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login'); 
  }
  res.render('new_wishlist'); 
});


router.post('/', upload.single('image'), async (req, res) => {
  try {
    
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    
    const newWishlist = new Wishlist({
      user_id: req.session.user._id,
      location: req.body.location,
      description: req.body.description,
      image_url: req.file ? `/uploads/${req.file.filename}` : null 
    });

    await newWishlist.save();
    res.redirect('/'); 
  } catch (err) {
    console.error('Error adding wishlist:', err);
    res.status(500).send('Error adding wishlist');
  }
});

router.delete('/:id', async (req, res) => {
    try {
      
      await Wishlist.findByIdAndDelete(req.params.id);
      res.redirect('/'); 
    } catch (err) {
      console.error('Error deleting wishlist item:', err);
      res.status(500).send('Error deleting wishlist item');
    }
  });

module.exports = router;