const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const session = require('express-session');
const path = require('path')

const isSignedIn = require('./middleware/is-signed-in.js');
const passUserToView = require('./middleware/pass-user-to-view.js');
const Trip = require('./models/Trip.js');
const Wishlist = require('./models/Wishlist.js')

const tripsController = require('./controllers/trips.js');
const wishlistController = require('./controllers/wishlist.js');

const authController = require('./controllers/auth.js');

const port = process.env.PORT ? process.env.PORT : '3000';

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// app.get('/', async (req, res) => {
//   try {
    
//     const destinations = await Destination.find();
//     // Pass the destinations to the template
//     res.render('index.ejs', { destinations });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Server error');
//   }
// });


app.use('/trips', tripsController);
app.use('/wishlist', wishlistController);

app.get('/', async (req, res) => {
  try {
    let trips = [];
    let wishlists = [];

    // Check if the user is logged in and fetch their trips
    if (req.session.user) {
      trips = await Trip.find({ user_id: req.session.user._id });
      wishlists = await Wishlist.find({ user_id: req.session.user._id });
    }

    // Render the homepage and pass the trips
    res.render('index', { user: req.session.user, trips, wishlists });
  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
});

app.use('/auth', authController);


app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`The express app is ready on port ${port}!`);
});
