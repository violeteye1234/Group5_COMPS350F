var	express = require('express'),
	app = express(),
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	session = require('express-session');
var user = {}
passport.serializeUser(function(user,done) {done(null,user);});
passport.deserializeUser(function(id, done) {done(null, user);});
app.use(session({
	secret: "Group5SecretStr",
	resave: true,
	saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
	console.log("Facebook Profile: "+JSON.stringify(profile));
	console.log(profile);
	user={};
	user['id'] = profile.id;
	user['name'] = profile.displayName;
	user['type'] = profile.provider;
	console.log('user object: '+JSON.stringify(user));
	return done(null, user);
	})
);

app.set('view engine', 'ejs');

app.use((req,res,next) => {
	let d = new Date();
	console.log(`TRACE: ${req.path} was requested at ${d.toLocaleDateString()}`);
	next();	
});

