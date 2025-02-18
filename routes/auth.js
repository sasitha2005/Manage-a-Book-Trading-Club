const express = require('express');
const passport = require('passport');
const router = express.Router();

// Sign Up
router.get('/signup', function(req,res) {
  res.render('signup', {
    title: "Signup",
    message: req.flash('signupMessage')
  });
});

router.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/auth/login',
  failureRedirect: '/auth/signup',
  failureFlash: true
}));

// Login
router.get('/login', function(req,res) {
  res.render('login', {
    title: "Login",
    message: req.flash('loginMessage')
  });
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/auth/login',
  failureFlash: true
}));

// Logout
router.get('/logout', function(req,res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;