// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var mongoose        = require('mongoose')
var User            = mongoose.model('User');
var moment          = require('moment-timezone');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        mongoose.model('User').findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'user[email]',
        passwordField : 'user[password]',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        mongoose.model('User').findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {
                var user = req.body.user;
                console.log(req.body)
                console.log(user)
                // if there is no user with that email
                // create the user
                var newUser            = new User(); 

                // set the user's local credentials
                newUser.email    = email;
                newUser.password = password;
                newUser.is_active = true;
                newUser.is_deleted = false;
                var date = new Date();
                date.setDate(date.getDate() + 1);
                newUser.created_at = moment.tz(date.toISOString(), "Asia/Kolkata");
                newUser.updated_at = moment.tz(date.toISOString(), "Asia/Kolkata"); 
                if (typeof user.group_id !== "undefined" && user.group_id != "") {
                  newUser.group_id = user.group_id;    
                }
                newUser.name = user.name
                if (typeof user.roles === "undefined") {
                    newUser.roles = ['Analyst'];
                } else {
                    newUser.roles = user.roles;
                }
                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, req.user);
                });
            }

        });    

        });

    }));


    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists

        mongoose.model('User').findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};



    