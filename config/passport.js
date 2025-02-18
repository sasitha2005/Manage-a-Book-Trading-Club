const LocalStrategy = require('passport-local');
const User = require('../models').User;

module.exports = function(passport) {

  // Serialization and Deserialization
  passport.serializeUser(function(user,done) {
    done(null,user.id);
  });

  passport.deserializeUser(function(id,done) {
    User.findById(id, function(err,user) {
      done(err,user);
    });
  });

  // Sign Up Strategy
  passport.use('local-signup',new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req,email,password,done) {
    process.nextTick(function() {
      User.findOne({'local.email':email}, function(err,user) {
        if (err) {
          return done(err);
        }
        if (user) {
          return done(null,false, req.flash('signupMessage','This email has already been taken'));
        } else {
          let theNewUser = new User();
          theNewUser.local.username = req.body.username;
          theNewUser.local.email = email;
          theNewUser.local.password = theNewUser.genHash(password);
          theNewUser.save(function(err) {
            if (err) {
              throw (err);
            }
            return done(null, theNewUser);
          });
        }
      });
    });
  }));

  // Login Strategy
  passport.use('local-login', new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
  }, function(req,email,password,done) {
    process.nextTick(function() {
      User.findOne({'local.email':email}, function(err,user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null,false,req.flash('loginMessage','No User Found'));
        }
        if (!user.validPassword(password)) {
          return done(null,false,req.flash('loginMessage','Invalid Password'));
        }
        return done(null,user);
      });
    });
  }));
};