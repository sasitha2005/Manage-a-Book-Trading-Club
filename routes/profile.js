const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const saltRounds = 10;

const { User, Book, Trade } = require('../models');

// Profile Route
router.get('/', isLoggedIn, function(req, res) {
  Book.find({ owner: req.user._id }).exec(function(err, books) {
    if (err) {
      console.log(err);
      return;
    }

    res.render("profile", {
      title: "Profile Page",
      books: books
    });
  });
});

// Change the Profile Setting
router.get('/setting/:id', isLoggedIn, function(req, res) {
  res.render('profile_setting', {
    title: 'Setting',
    message: req.flash('settingMessage')
  });
});

// Update the Post Setting
router.post('/setting/:id', isLoggedIn, function(req, res) {
  let id = req.params.id;
  let myNewUsername = req.body.username;
  let myNewEmail = req.body.email;
  let myNewPassword = req.body.password;
  let salt = bcrypt.genSaltSync(saltRounds);
  let hash = bcrypt.hashSync(myNewPassword, salt);
  let myNewCity = req.body.city;
  let myNewCounty = req.body.county;
  let myNewCountry = req.body.country;

  User.findByIdAndUpdate(id, {
    "local.username": myNewUsername,
    "local.email": myNewEmail,
    "local.password": hash,
    "local.city": myNewCity,
    "local.county": myNewCounty,
    "local.country": myNewCountry
  }, { new: true }, function(err, user) {
    if (err) {
      req.flash('settingMessage', 'There is an error.  Please check your input or try again later!');
      res.redirect('/');
    }
    res.redirect('/profile');
  });
});

// Add the book to profile
router.post('/addBook', isLoggedIn, function(req, res) {
  let myNewBook = new Book();
  myNewBook.bookid = req.body.bookid;
  myNewBook.title = req.body.title;
  myNewBook.description = req.body.description;
  myNewBook.author = req.body.author;
  myNewBook.publisher = req.body.publisher;
  myNewBook.link = req.body.link;
  myNewBook.imageurl = req.body.imageurl;
  myNewBook.owner = req.user._id;
  myNewBook.status = req.body.status;

  // Save the book
  myNewBook.save(function(err) {
    if (err) {
      console.log(err);
    }

    User.findById(req.user._id, function(err, user) {
      if (err) {
        console.log(err);
        return;
      }
      if (!user.local.addedbooks) {
        user.local.addedbooks = [];  // Initialize the array if it doesn't exist
      }
      user.local.addedbooks.push(myNewBook._id); // Ensure it's the book ID being pushed
      user.save(function(err) {
        if (err) {
          console.log(err);
          return;
        }
        res.redirect('/profile');
      });
    });
  });
});

// Delete Book from the Profile
router.post('/removeBook/:bookID', isLoggedIn, function(req, res) {
  let book_id = req.params.bookID;
  User.findById(req.user._id, function(err, user) {
    if (err) {
      console.log(err);
      return;
    }

    if (!user.local.addedbooks) {
      user.local.addedbooks = [];
    }

    let bookIndex = user.local.addedbooks.indexOf(book_id);

    if (bookIndex > -1) {
      user.local.addedbooks.splice(bookIndex, 1);

      user.save(function(err) {
        if (err) {
          console.log(err);
          return;
        }

        Book.findByIdAndRemove(book_id, function(err) {
          if (err) {
            console.log(err);
            return;
          }
          res.redirect('/profile');
        });
      });
    } else {
      console.log(`Book with ID ${book_id} not found in user's addedbooks array`);
      res.redirect('/profile');
    }
  });
});

// LogIn function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
