const express = require('express');
const app = express();
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');

//login
const users_login = {
    'test1': 'abc',
    'test2': 'def'
};

app.use(session({
    secret: "Group5SecretStr",
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse form data

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: '1585378616193751',
    clientSecret: '2d820434613624fb157711fda31a449f',
    callbackURL: 'http://localhost:8099/auth/facebook/callback'
},
    (token, refreshToken, profile, done) => {
        console.log("Facebook Profile: " + JSON.stringify(profile));
        let user = {};
        user['id'] = profile.id;
        user['name'] = profile.displayName;
        user['type'] = profile.provider;
        console.log('user object: ' + JSON.stringify(user));
        return done(null, user);
    })
);

//mongodb connection
var { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const mongourl = 'mongodb+srv://kyk123456:031216Kyk@cluster0.pter2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'Animals';
const collectionName = 'animal';


const client = new MongoClient(mongourl,{
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.set('view engine', 'ejs');
app.set('views', './views'); 

app.use(express.static('public'));

app.use((req, res, next) => {
    let d = new Date();
    console.log(`TRACE: ${req.path} was requested at ${d.toLocaleDateString()}`);
    next();
});

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
};

//find all animals
const findAllAnimals = async (db, criteria = {}) => {	
	let findResults = [];
	let collection = db.collection(collectionName);
	findResults = await collection.find(criteria).toArray();

    console.log(`findCriteria: ${JSON.stringify(criteria)}`);
	console.log(`findDocument: ${findResults.length}`);
	console.log(`findResults: ${JSON.stringify(findResults)}`);	
	return findResults;
};

const handle_FindAll = async (res) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    
    //const dogsCollection = db.collection('animal'); ca ged this
    
    //const animal = await dogsCollection.find({}).toArray(); // Fetch all dogs changed this
    const animal = await findAllAnimals(db);

    // Combine the results
    const allAnimals = [...animal];
    
    await client.close();
    console.log("Closed DB connection");
    res.status(200).render('history', { nAnimals: allAnimals.length, animals: allAnimals }); // Pass both nAnimals and animals
};

// Serve the login form
app.get("/login", (req, res) => {
    res.render('login', { message: null }); // Use 'login.ejs' for the form
});

app.post("/login", (req, res, next) => {
    const username = req.body.name;
    const password = req.body.password;
    if (users_login[username] && users_login[username] === password) {
        req.login({ username: username }, (err) => {
            if (err) {
                return res.render('login', { message: 'Login failed. Please try again.' });
            }
            return res.redirect('/content'); // Redirect to content after successful login
        });
    } else {
        res.render('login', { message: 'Invalid username or password' }); // Render 'login.ejs' with the message
    }
});

app.get("/auth/facebook", passport.authenticate("facebook", { scope: "email" }));
app.get("/auth/facebook/callback",
    passport.authenticate("facebook", {
        successRedirect: "/content",
        failureRedirect: "/login"
    })
);

app.get('/', isLoggedIn, (req, res) => {
    res.redirect('/content');
});

app.get("/content", isLoggedIn, (req, res) => {
    res.render('loggedIn', { user: req.user }); // Use 'loggedIn.ejs' for logged-in view
});

app.get("/view", isLoggedIn, (req, res) => {
	res.render('view', {user: req.user});
});

app.get("/report", isLoggedIn, (req, res) => {
	res.render('report', {user:req.user});
});

//app.get("/history", isLoggedIn, (req, res) => {
//	res.render('history', {user: req.user});
//});
app.get('/history', isLoggedIn, (req, res) => {
    handle_FindAll(res); // Calls handle_Find to show all animals
});
app.get("/help", isLoggedIn, (req, res) => {
	res.render('help', {user: req.user});
});

app.get("/information", isLoggedIn, (req, res) => {
	res.render('information', {user: req.user});
});

app.get('/*', (req, res) => {
    res.status(404).render('information', { message: `${req.path} - Unknown request!` });
});

const port = process.env.PORT || 8099;
app.listen(port, () => { console.log(`Listening at http://localhost:${port}`); });
