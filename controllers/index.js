const express = require('express');
const router = express.Router();
const Destination = require('../models/Destination');



router.get('/', async (req, res) => {
    try {
      const destinations = await Destination.find();
      res.render('index', { destinations });
    } catch (err) {
      res.status(500).send('Error retrieving destinations');
    }
  });

  module.exports = router;