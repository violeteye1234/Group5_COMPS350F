var express             = require('express'),
    app                 = express(),
    passport            = require('passport'),
    FacebookStrategy    = require('passport-facebook').Strategy,
    session             = require('express-session');

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
	"clientID":'1585378616193751',
	"clientSecret":'2d820434613624fb157711fda31a449f',
	"callbackURL":'http://localhost:8099/auth/facebook/callback'
},
function (token, refreshToken, profile, done){
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

const isLoggedIn = (req,res,next) => {
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}

app.get("/login", function(req,res){
	res.status(200).render('login');
});

app.get("/auth/facebook", passport.authenticate("facebook", {scope: "email"}));
app.get("/auth/facebook/callback",
	passport.authenticate("facebook",{
		successRedirect: "/content",
		failureRedirect: "/"
}));

app.get('/', isLoggedIn, (req,res) => {
	res.redirect('/loggedIn');
})

app.get("/content", isLoggedIn, function(req,res){
	res.render('loggedIn', {user:req.user});
});

app.get('/*', (req,res)=>{
	res.status(404).render('information', {message: `${req.path} - Unknown request!`});
})

const port = process.env.PORT || 8099;
app.listen(port, () => {console.log(`Listening at http://localhost:${port}`);});