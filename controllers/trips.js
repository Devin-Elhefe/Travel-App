const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

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
    res.render('new_trip'); 
  });
  router.get('/:id/edit', async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id);
      if (!trip) {
        return res.status(404).send('Trip not found');
      }
      res.render('edit_trip', { trip }); 
    } catch (err) {
      console.error('Error fetching trip:', err);
      res.status(500).send('Server error');
    }
  });
  
  
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      
      console.log('Session User:', req.session.user);
  
      
      if (!req.session.user) {
        return res.redirect('/auth/login');
      }
  
      
      const newTrip = new Trip({
        user_id: req.session.user._id,
        location: req.body.location,
        description: req.body.description,
        image_url: req.file ? `/uploads/${req.file.filename}` : null 
      });
  
      await newTrip.save();
      res.redirect('/'); 
    } catch (err) {
      console.error('Error adding trip:', err);
      res.status(500).send('Error adding trip');
    }
  });
  router.put('/:id', upload.single('image'), async (req, res) => {
    try {
      const updateData = {
        location: req.body.location,
        description: req.body.description,
      };
  
      
      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
      }
      console.log("Update Data:", updateData);
  
      const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedTrip) {
        return res.status(404).send('Trip not found');
      }
  
      res.redirect('/'); 
    } catch (err) {
      console.error('Error updating trip:', err);
      res.status(500).send('Error updating trip');
    }
  });

  
router.delete('/:id', async (req, res) => {
    try {
      
      await Trip.findByIdAndDelete(req.params.id);
      res.redirect('/'); 
    } catch (err) {
      console.error('Error deleting trip:', err);
      res.status(500).send('Error deleting trip');
    }
  });


module.exports = router;