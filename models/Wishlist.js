const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
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
  }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
module.exports = Wishlist;