'use strict';

const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Logs = mongoose.model('Logs');

exports.setup = function (User, config) {
  passport.serializeUser(function(user, done) {
    done(null, user._id)
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  })

  passport.use(new LocalStrategy({
    usernameField: 'mobile',
    passwordField: 'mobileCaptcha'
  }, (mobile, mobileCaptcha, done) =>{
    User.findOne({mobile: mobile }, async (err, user) => {
      if (err) { return done(err); }
      if (!user) {
        let newUser = new User({ mobile: mobile });
    		user = await newUser.save();
    		await Logs.create({
    			uid: user._id,
    			content:"创建新用户 "+ (user.mobile),
    			type:"user"
    		})
      }
      return done(null, user);
    })
  }))
}
