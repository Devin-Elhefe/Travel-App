const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const User = require('../models/user.js');

router.get('/register', (req, res) => {
  res.render('register.ejs');
})
router.get('/login', (req, res) => {
  res.render('login.ejs');
})
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
})

router.post('/register', async (req, res) => {
  try {
    
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.send('Username already taken.');
    }
      
    if (req.body.password !== req.body.confirmPassword) {
      return res.send('Password and Confirm Password must match');
    }
  
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;
  
    
    await User.create(req.body);
  
    res.redirect('/auth/login');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log(req.body);
    // First, get the user from the database
    const userInDatabase = await User.findOne({ email: req.body.email });
    if (!userInDatabase) {
      return res.send('Login failed. No user.');
    }
  
    // There is a user! Time to test their password with bcrypt
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    console.log(validPassword)
    if (!validPassword) {
      return res.send('Login failed. Please try again.');
    }
  
    // There is a user AND they had the correct password. Time to make a session!
    // Avoid storing the password, even in hashed format, in the session
    // If there is other data you want to save to `req.session.user`, do so here!
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id
    };
  
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

module.exports = router;
