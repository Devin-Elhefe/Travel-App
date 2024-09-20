const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image_url: {
    type: String  
 
}});

const Trip = mongoose.model('Trip', tripSchema);
module.exports = Trip;