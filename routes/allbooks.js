const express = require('express');
const router = express.Router();
// Import Models
const Book = require('../models').Book;
const User = require('../models').User;
const Trade = require('../models').Trade;

router.get('/',isLoggedIn,function(req,res) {
  // Find and Populate Available Books
  Book.find({status:'available'}).populate({path:'owner',model:'user'}).exec(function(err,books) {
    if (err) {
      console.log(err);
      return;
    }
    let currentUser = req.user._id;

    // Get total pending request from other book owners to current user
    Trade.find({to:currentUser,status:'pending'}).populate({path:'book',model:'book'}).exec(function(err,reqsFromOwnerToUser) {
      // Trade requests for the user (you)
      let reqsFromOwnerToUserCount = reqsFromOwnerToUser.length;

      // Get Total Pending Request from Current User to Other Book Owners
      Trade.find({from:currentUser,status:'pending'}).populate({path:'book',model:'book'}).exec(function(err,reqsFromUserToOwner) {
        // Your trade requests
        let reqsFromUserToOwnerCount = reqsFromUserToOwner.length;
        res.render('allbooks', {
          title: 'All Books',
          message: req.flash('tradeMessage'),
          books: books,
          reqsFromOwnerToUser: reqsFromOwnerToUser,
          reqsFromUserToOwner: reqsFromUserToOwner
        });
      });
    }); 
  });
});

// LogIn function
function isLoggedIn(req,res,next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
module.exports = router;