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

    
  // Route to display all trips (GET /trips)
  router.get('/new', (req, res) => {
    if (!req.session.user) {
      return res.redirect('/auth/login'); // Redirect to login if not logged in
    }
    res.render('new_trip'); // Render the form to add a new trip
  });
  router.get('/:id/edit', async (req, res) => {
    try {
      const trip = await Trip.findById(req.params.id);
      if (!trip) {
        return res.status(404).send('Trip not found');
      }
      res.render('edit_trip', { trip }); // Render the edit form
    } catch (err) {
      console.error('Error fetching trip:', err);
      res.status(500).send('Server error');
    }
  });
  
  // Route to add a new trip (POST /trips)
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      // Log the session user for debugging
      console.log('Session User:', req.session.user);
  
      // Ensure the user is logged in
      if (!req.session.user) {
        return res.redirect('/auth/login');
      }
  
      // Create a new trip with the uploaded image (if available)
      const newTrip = new Trip({
        user_id: req.session.user._id,
        location: req.body.location,
        description: req.body.description,
        image_url: req.file ? `/uploads/${req.file.filename}` : null // Store uploaded file path
      });
  
      await newTrip.save();
      res.redirect('/'); // Redirect to the list of trips after adding
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
  
      // If a new image is uploaded, update the image URL
      if (req.file) {
        updateData.image_url = `/uploads/${req.file.filename}`;
      }
      console.log("Update Data:", updateData);
  
      const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true });
      if (!updatedTrip) {
        return res.status(404).send('Trip not found');
      }
  
      res.redirect('/'); // Redirect to homepage after editing
    } catch (err) {
      console.error('Error updating trip:', err);
      res.status(500).send('Error updating trip');
    }
  });

  // Route to delete a trip
router.delete('/:id', async (req, res) => {
    try {
      // Find and delete the trip by ID
      await Trip.findByIdAndDelete(req.params.id);
      res.redirect('/'); // Redirect to the homepage after deletion
    } catch (err) {
      console.error('Error deleting trip:', err);
      res.status(500).send('Error deleting trip');
    }
  });


module.exports = router;