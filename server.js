const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const books = require('google-books-search');
const app = express();
const bcrypt = require('bcryptjs');


// MongoDB connection
mongoose.connect("mongodb+srv://user1:amri1977@freecodecamp.lsrd9.mongodb.net/bookswap?retryWrites=true&w=majority&appName=freecodecamp", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

// Set Up Template Engine
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

// DB Models
const Book = require('./models').Book;
const User = require('./models').User;
const Trade = require('./models').Trade;

// Passport Config
require('./config/passport.js')(passport);

// Book API
const option = require('./config/bookapi.js');

// Routes
const auth = require('./routes/auth.js');
const profile = require('./routes/profile.js');
const trades = require('./routes/trades.js');
const allbooks = require('./routes/allbooks.js');

// Add console logs to confirm each route is loaded
console.log('Auth route loaded:', auth);
console.log('Profile route loaded:', profile);
console.log('Trades route loaded:', trades);
console.log('Allbooks route loaded:', allbooks);

// Use Routes
app.use('/auth', auth);
app.use('/profile', profile);
app.use('/trades', trades);
app.use('/allbooks', allbooks);

// Home Route
app.get('/', function (req, res) {
  books.search('Web Development', {
    field: 'title',
    offset: 0,
    limit: 9,
    type: 'books',
    order: 'relevance',
    lang: 'en'
  }, function (error, results, apiResponse) {
    if (error) {
      res.send(error);
    } else {
      res.render('index', {
        title: 'Home',
        books: results
      });
    }
  });
});

// Search Route
app.get('/search', function (req, res) {
  let title = req.query.title;
  books.search(title, {
    field: 'title',
    offset: 0,
    limit: 40,
    type: 'books',
    order: 'relevance',
    lang: 'en'
  }, function (error, results, apiResponse) {
    if (!error) {
      res.render('search', {
        title: 'Search Book',
        books: results
      });
    } else {
      console.log(error);
      res.status(404).send('File Not Found!');
    }
  });
});

// Start Server
const port = 3006;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
