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
      user.local.addedbooks.push(myNewBook);
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

// Route to get all books
router.get('/allbooks', isLoggedIn, async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id }).exec();
    res.render('allbooks', { books });
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).send('Error fetching books');
  }
});

// Delete Book from the Profile
router.post('/removeBook/:bookID', isLoggedIn, function(req, res) {
  let book_id = req.params.bookID;
  User.findById(req.user._id, function(err, user) {
    if (err) {
      console.log(err);
      return;
    }

    let bookIndex = user.local.addedbooks.indexOf(book_id);
    user.local.addedbooks.splice(bookIndex, 1);
    user.save(function(err) {
      if (err) {
        console.log(err);
        return;
      }

      Book.findByIdAndRemove(book_id, function(err, book) {
        if (err) {
          console.log(err);
          return;
        }
        res.redirect('/profile');
      });
    });
  });
});

// Trade List
router.get('/trade', isLoggedIn, function(req, res) {
  Book.find({ owner: req.user._id }).exec(function(err, books) {
    if (err) {
      console.log(err);
      return;
    }

    res.render("profile_tradelist", {
      title: "Profile Tradelist",
      books: books
    });
  });
});

// Trade Books
router.post('/trade/:bookID', isLoggedIn, function(req, res) {
  let book_id = req.params.bookID;
  let currentUser = req.user._id;
  Book.findById(book_id).populate({ path: 'owner', model: 'User' }).exec(function(err, book) {
    if (err) {
      console.log(err);
      return;
    }

    if (!book || !book.owner) {
      console.error('Book or Book owner not found');
      res.status(500).send('Book or Book owner not found');
      return;
    }

    let bookOwner = book.owner._id;

    // If requester is current user, flash bad request
    if (currentUser.equals(bookOwner)) {
      req.flash('tradeMessage', "Bad Request");
      res.redirect('/allbooks');
    } else {
      // Find if trade existed
      Trade.findOne({ from: currentUser, to: bookOwner, book: book._id, status: 'pending' }, function(err, trade) {
        if (err) {
          console.log(err);
          return;
        }

        if (trade) {
          // If trade existed, flash message and redirect to allbooks Page
          console.log('You already submitted trade request to the book owner');
          req.flash('tradeMessage', 'You already submitted trade request to the book owner');
          res.redirect('/allbooks');
        } else {
          // If trade does not exist, save new trade request to new collection
          let myNewTrade = new Trade();
          myNewTrade.from = currentUser;
          myNewTrade.to = bookOwner;
          myNewTrade.book = book._id;

          // Save new trade request
          myNewTrade.save(function(err) {
            if (err) {
              console.log(err);
              return;
            }

            // Change book status from available to pending
            book.status = 'pending';
            // Save new book status
            book.save(function(err) {
              if (err) {
                console.log(err);
              }
              req.flash('tradeMessage', 'Good Request');
              res.redirect('/allbooks');
            });
          });
        }
      });
    }
  });
});

router.get('/allbooks/trade', isLoggedIn, async (req, res) => {
  try {
    const books = await Book.find().populate('owner', 'local.username').exec();
    const reqsFromUserToOwner = await Trade.find({ proposer: req.user._id }).populate('book').exec();
    const reqsFromOwnerToUser = await Trade.find({ proposee: req.user._id }).populate('book').exec();

    res.render('allbooks', {
      books,
      reqsFromUserToOwner,
      reqsFromOwnerToUser,
      user: req.user,
      message: req.flash('tradeMessage')
    });
  } catch (err) {
    console.error('Error fetching books and trades:', err);
    res.status(500).send('Error fetching books and trades');
  }
})

// Login function
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
