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

// Route to display the form to add a wishlist item
router.get('/new', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login'); // Redirect to login if not logged in
  }
  res.render('new_wishlist'); // Render the form to add a new wishlist item
});

// Route to add a new wishlist item
router.post('/', upload.single('image'), async (req, res) => {
  try {
    // Ensure the user is logged in
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    // Create a new wishlist item with the uploaded image (if available)
    const newWishlist = new Wishlist({
      user_id: req.session.user._id,
      location: req.body.location,
      description: req.body.description,
      image_url: req.file ? `/uploads/${req.file.filename}` : null // Store uploaded file path
    });

    await newWishlist.save();
    res.redirect('/'); // Redirect to homepage after adding the wishlist item
  } catch (err) {
    console.error('Error adding wishlist:', err);
    res.status(500).send('Error adding wishlist');
  }
});
// Route to delete a wishlist item
router.delete('/:id', async (req, res) => {
    try {
      // Find and delete the wishlist item by ID
      await Wishlist.findByIdAndDelete(req.params.id);
      res.redirect('/'); // Redirect to the homepage after deletion
    } catch (err) {
      console.error('Error deleting wishlist item:', err);
      res.status(500).send('Error deleting wishlist item');
    }
  });

module.exports = router;