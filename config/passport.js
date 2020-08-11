var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var User = require('../models/user.model');
var configAuth = require('./auth');

module.exports = function (passport) {
	// 
	passport.use(new GoogleStrategy({
		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL,
		// passReqToCallback   : true
	},
		function (accessToken, refreshToken, profile, cb) {
			return cb(null, profile);
		}
	));
	passport.use(new FacebookStrategy({
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL
	},
		function (accessToken, refreshToken, profile, cb) {
			
			return cb(null, profile);
		}
	));
	


	// passport.use('local-signup', new LocalStrategy({
	// 	usernameField: 'email',
	// 	passwordField: 'password',
	// 	passReqToCallback: true
	// },
	// function(req, email, password, done){
	//     console.log(email);
	// 	process.nextTick(function(){
	// 		User.single(email, function(err, user){
	// 			if(err)
	// 				return done(err);
	// 			if(user){
	// 				return done(null, false, req.flash('signupMessage', 'That email already taken'));
	// 			} else {
	// 				var newUser = new User();
	// 				newUser.local.username = email;
	// 				newUser.local.password = newUser.generateHash(password);

	// 				newUser.save(function(err){
	// 					if(err)
	// 						throw err;
	// 					return done(null, newUser);
	// 				})
	// 			}
	// 		})

	// 	});
	// }));

	// passport.use('local-login', new LocalStrategy({
	// 		usernameField: 'email',
	// 		passwordField: 'password',
	// 		passReqToCallback: true
	// 	},
	// 	function(req, email, password, done){
	// 		process.nextTick(function(){
	//             console.log(email);
	// 			// User.single(email, function(err, user){
	// 			// 	if(err)
	// 			// 		return done(err);
	// 			// 	if(!user)
	// 			// 		return done(null, false, req.flash('loginMessage', 'No User found'));
	// 			// 	if(!user.validPassword(password)){
	// 			// 		return done(null, false, req.flash('loginMessage', 'invalid password'));
	// 			// 	}
	// 			// 	 return done(null, user);
	//             //     // return ;
	// 			// });
	// 			return ;
	// 		});
	// 	}
	// ));


	// // passport.use(new FacebookStrategy({
	// //     clientID: configAuth.facebookAuth.clientID,
	// //     clientSecret: configAuth.facebookAuth.clientSecret,
	// //     callbackURL: configAuth.facebookAuth.callbackURL
	// //   },
	// //   function(accessToken, refreshToken, profile, done) {
	// //     	process.nextTick(function(){
	// //     		User.findOne({'facebook.id': profile.id}, function(err, user){
	// //     			if(err)
	// //     				return done(err);
	// //     			if(user)
	// //     				return done(null, user);
	// //     			else {
	// //     				var newUser = new User();
	// //     				newUser.facebook.id = profile.id;
	// //     				newUser.facebook.token = accessToken;
	// //     				newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	// //     				newUser.facebook.email = profile.emails[0].value;

	// //     				newUser.save(function(err){
	// //     					if(err)
	// //     						throw err;
	// //     					return done(null, newUser);
	// //     				})
	// //     				console.log(profile);
	// //     			}
	// //     		});
	// //     	});
	// //     }

	// // ));

	// passport.use(new GoogleStrategy({
	//     clientID: configAuth.googleAuth.clientID,
	//     clientSecret: configAuth.googleAuth.clientSecret,
	//     callbackURL: configAuth.googleAuth.callbackURL
	//   },
	//   function(accessToken, refreshToken, profile, done) {
	//     	process.nextTick(function(){
	//     		User.single(profile.emails[0].value, function(err, user){
	//                 console.log(profile.emails[0].value)
	//                 if(err)
	//     				return done(err);
	//     			if(user)
	//     				return done(null, user);
	//     			else {
	//     				// var newUser = new User();
	//     				// newUser.google.id = profile.id;
	//     				// newUser.google.token = accessToken;
	//     				// newUser.google.name = profile.displayName;
	//     				// newUser.google.email = profile.emails[0].value;

	//     				// newUser.save(function(err){
	//     				// 	if(err)
	//     				// 		throw err;
	//     				// 	return done(null, newUser);
	//                     // })
	//                     console.log(profile);
	//                     return done(err);

	//     			}
	//     		});
	//     	});
	//     }

	// ));





};