const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
// var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;


module.exports = () => {
    const User = mongoose.model('User');
    passport.use('user', new LocalStrategy({
        usernameField: 'emailAddress',
        passwordField: 'hash'
    }, (username, password, done) => {
        User.findOne({ 'emailAddress': username }, (err, client) => {
            if (err) {
                return done(err);
            }
            if (!client) {
                return done(null, false, {
                    message: "Incorrect email."
                });
            }
            if (!client.ValidPassword(password)) {
                return done(null, false, {
                    message: "Incorrect password."
                });
            }
            return done(null, client);
        });
    }));
};