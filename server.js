const express = require('express');
const app = express();
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const formidable = require('express-formidable'), fsPromises = require('fs').promises;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.set('view engine', 'ejs');
app.set('views', './views'); 

//const cors = require('cors');
//app.use(cors());
//app.get('/favicon.ico', (req, res) => res.status(204));

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

const animalSchema = require('./models/animal');
const animals = mongoose.model('animal', animalSchema);

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // added
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse form data

//try
//app.use(formidable());
app.use((req, res,next) => {
	console.log(`Received request for: ${req.originalUrl}`);
	next();
})

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: '8596720763773735', 
    clientSecret: '8e5a7dc3e7fbf9be4c92319040c97ac0',
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

/*
mongoose.connect(mongourl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

.then(() => {
    console.log("MongoDB connected successfully");
})
.catch(err => {
    console.error("MongoDB connection error:", err);
});
*/
const client = new MongoClient(mongourl,{
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

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
    const animal = await findAllAnimals(db);
// Combine the results
    const allAnimals = [...animal];
    await client.close();
    console.log("Closed DB connection")
    res.status(200).render('history', { nAnimals: allAnimals.length, animals: allAnimals }); // Pass both nAnimals and animals
};

const findOneAnimalDocument = async (db, criteria) => {
    const collection = db.collection(collectionName);
    return await collection.find(criteria).toArray();
    console.log("findOnaAnimalDocument", collection)
};

const handle_FindOne = async (req, res) => {
    let db;
    try {
        await client.connect();
        console.log("Connected successfully to server");
        db = client.db(dbName);

        console.log("Request body:", req.body);

    // create query
        const criteria = {
            Location: new RegExp(req.body.Location, 'i'), // 'i' \u8868\u793a\u5ffd\u7565\u5927\u5c0f\u5199
            Type: new RegExp(req.body.Type, 'i'),
            Breed: new RegExp(req.body.Breed, 'i'),
            Gender: new RegExp(req.body.Gender, 'i'),
            Prominent_Features: new RegExp(req.body.Prominent_Features, 'i'),
            Disabilities: new RegExp(req.body.Disabilities, 'i'),
            Adopted: new RegExp(req.body.Adopted,'i')
        };
    
    console.log("Search criteria:", criteria);//for debug
    // \u79fb\u9664\u7a7a\u6216\u672a\u5b9a\u4e49\u7684\u952e
    Object.keys(criteria).forEach(key => {
        if (!criteria[key]) {
            delete criteria[key];
        }
    });
    console.log("Search criteria2:", criteria);//for debug

    const foundAnimals = await findOneAnimalDocument(db, criteria);
    console.log("Found Results :", foundAnimals);

    if (foundAnimals.length > 0) {
        res.status(200).render('view1', { variable1: foundAnimals});
    } else {
        console.log('No results found');
        res.redirect('/history');
    }
} catch (error) {
    console.error("Error occurred:", error);
    res.status(500).send("Internal server error");
} finally { 
	if (db) {
		await client.close();
	}
}
};

const passAnimalDocument = async (req, res) => {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    const DOCID = {_id: new ObjectId(req.params.id)};
    const animal = await findOneAnimalDocument(db, DOCID);

	if(animal.length > 0) {
	    res.render('view_update', {animal: animal[0]});
	} else {
	    console.log('find method wrong or Animal not found')
	}
}

//update View
const updateDocument = async (db, criteria, updateData) => {
	var collection = db.collection(collectionName);
	let results = await collection.updateOne(criteria,{$set: updateData});
	return results;
}

//view update save
const handle_UpdateSaveView = async (req, res) => {
	await client.connect();
	console.log("Connected successfully to server");
	const db = client.db(dbName);
	//let DOCID = {_id: ObjectId(req.params.id)};
	let DOCID = {_id: new ObjectId(req.params.id)};
	const docs = await findOneAnimalDocument(db, DOCID);
	//const id = docs[0]["_id"];
	console.log("id",req.params.id);
	console.log(docs[0]._id.toString());
	console.log("Documents found:", docs);
	//if (docs.length > 0 && docs[0]['_id'] == req._id) {
	if (docs.length > 0 && docs[0]._id.toString() === req.params.id) {
	const updateData = {
		Animal_name: req.body.Animal_name,
		Type: req.body.Type,
		Breed: req.body.Breed,
		Gender: req.body.Gender,
		Location: req.body.Location,
		Prominent_Features: req.body.Prominent_Features,
		Disabilities: req.body.Disabilities,
		Adopted: req.body.Adopted,
        Upload_Image: req.body.Upload_Image,
	};
	
	//photo update
	
	console.log("File uploaded:", req.file);
    if (req.file) {
        const data = await fsPromises.readFile(req.file.path);
        updateData.Upload_Image = Buffer.from(data).toString('base64');
    } else {
        console.error("No file uploaded.");
    }
        
	console.log("Update data:", updateData);
	const results = await updateDocument(db, DOCID, updateData);
	console.log("Update results:", results);
	res.status(200).render('info', { message: `Updated ${results.modifiedCount} document(s), user: req.user `});
	} else {
		res.status(500).render('info', {message: 'save error !', user: req.user});
	}
}

//DELETE
const deleteDocument = async (db,criteria) => {
	var collection = db.collection(collectionName);
	let results = await collection.deleteMany( criteria );
	return results;
}

const handle_Delete = async(req,res) => {
	await client.connect();
	const db = client.db(dbName);
	let DOCID = {_id: ObjectId.createFromHexString(req.body._id)};
	const docs = await findOneAnimalDocument(db,DOCID);
	if (docs.length > 0 && docs[0].userid === req.user.id) {
		await deleteDocument(db,DOCID);
		res.redirect('/history');
	}else{
		console.log('didnt work');
		res.redirect('/history');
	}
}

//insert
const insertDocument = async (db,doc) => {
	var collection = db.collection(collectionName);
	let results = await collection.insertOne(doc);
	console.log("insert one document:" +JSON.stringify(results));
	return results;
}

const handle_Create = async (req, res) => {
	await client.connect();
	console.log("Connected successfully to server");
	const db = client.db(dbName);
	next_page_type =req.body.type;
	console.log(next_page_type);
	res.redirect('/report_enter');
}

const handle_Create1 = async (req, res) => {
	await client.connect();
	console.log("Connected successfully to server");
	const db = client.db(dbName);
	const new_empty = '';
	console.log(req.body.name);
	console.log(req.body.breed);
	console.log(req.body.disability);
	console.log(req.body.gender);
	console.log(req.body.location);
	console.log(req.body.prominent_feature);
	console.log(req.body.image);
	const new_animal = new animals({
		Report : new_empty,
		Type : next_page_type,
		Animal_name : req.body.name,
		Time : new_empty,
		Adopted : new_empty,
		Breed : req.body.breed,
		Disabilities : req.body.disability,
		Gender : req.body.gender,
		Location : req.body.location,
		Prominent_Features : req.body.prominent_feature,
		Upload_Image: req.body.Upload_Image
	});

    console.log("File uploaded:", req.file);
    if (req.file) {
        const data = await fsPromises.readFile(req.file.path);
        new_animal.Upload_Image = Buffer.from(data).toString('base64');
    } else {
        console.error("No file uploaded.");
    }

	await insertDocument(db, new_animal);
	console.log(new_animal);
	res.redirect('/history');
}

// Serve the login form
app.get("/login", (req, res) => {
	res.render('login', { message: null }); // Use 'login.ejs' for the form kk?
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

//delete post
app.post('/delete', isLoggedIn, async (req, res) => {
	console.log("Delete request received");
	await handle_Delete(req, res);
});

app.get('/', isLoggedIn, (req, res) => {
	res.redirect('/content');
});

app.get("/content", isLoggedIn, (req, res) => {
	res.render('loggedIn', { user: req.user }); // Use 'loggedIn.ejs' for logged-in view
});

app.get("/view", isLoggedIn, (req, res) => {
	res.render('view', {user: req.user});
});

//view_find POST
app.post('/view', isLoggedIn, async (req, res) => {
	console.log("view find req");
	await handle_FindOne(req, res);
})

//view_update get
// use /:id \u4eceview1.ejs update button\u5904\u62ff animal._id
app.get('/update/:id', isLoggedIn, async(req, res) => {
	console.log("update start!");
	await passAnimalDocument(req, res);
})

//view_save update
app.post('/update/:id', isLoggedIn, upload.single('filetoupload'), async (req, res) => {
	console.log("Update to save");
	console.log("Requested ID:", req.params.id); // Log the specific ID being requested
	console.log("Request parameters:", req.params); // Log all parameters
	await handle_UpdateSaveView(req, res);
})

app.get("/report", isLoggedIn, (req, res) => {
	res.render('report', {user:req.user});
});

app.post("/report", isLoggedIn,(req, res) => {
	handle_Create(req, res);
});

app.get("/report_enter", isLoggedIn, upload.single('image'), (req, res) => {
	res.render('report_enter', {user:req.user});
});

app.post("/report_enter", isLoggedIn, (req, res) => {
	handle_Create1(req, res);
});

app.get('/history', isLoggedIn, (req, res) => {
	handle_FindAll(res); // Calls handle_Find to show all animals
});
app.get("/help", isLoggedIn, (req, res) => {
	res.render('help', {user: req.user});
});

app.get("/information", isLoggedIn, (req, res) => {
	res.render('information', {user: req.user});
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if (err) { return next(err); }
        res.redirect('/login'); 
    });
});
// Taha & Awais 6:53pm 28/11/2024

//CREATE RESTFUL
app.post('/api/animals/:Animal_name', async (req, res) => {
    try {
        if (req.params.Animal_name) {
            console.log(req.body);
            await client.connect();
            const db = client.db(dbName);
            // Create a new document from the request body
            let newDoc = {
                Animal_name: req.params.Animal_name,
                gender: req.body.gender
            };
            console.log("Inserting document:", newDoc);
            const result = await insertDocument(db, newDoc); // Await this call
            console.log("Insert result:", result);
            res.status(201).json({ "Successfully inserted": newDoc }); // Correct response
        } else {
            res.status(400).json({ "error": "missing animal name!" });
        }
    } catch (error) {
        console.error("Error inserting document:", error);
        res.status(500).json({ "error": "Internal server error" });
    } finally {
        await client.close(); // Ensure the client is closed
    }
});

//READ ALL ANIMALS RESTFUL
app.get('/api/animals', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const animals = await findAllAnimals(db);
        res.status(200).json(animals);
    } catch (error) {
        console.error("Error retrieving animals:", error);
        res.status(500).json({ "error": "Internal server error" });
    } finally {
        await client.close();
    }
});
//curl -X GET http://localhost:8099/api/animals

//READ SPECIFIC ANIMAL RESTFUL
app.get('/api/animals/name/:Animal_name', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const animal = await findOneAnimalDocument(db, { Animal_name: req.params.Animal_name });
        if (animal.length > 0) {
            res.status(200).json(animal[0]);
        } else {
            res.status(404).json({ "error": "Animal not found" });
        }
    } catch (error) {
        console.error("Error retrieving animal:", error);
        res.status(500).json({ "error": "Internal server error" });
    } finally {
        await client.close();
    }
});
//curl -X GET http://localhost:8099/api/animals/name/<Animal_name>

//UPDATE RESTFUL
app.put('/api/animals/name/:Animal_name', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const updateData = req.body;
        const result = await updateDocument(db, { Animal_name: req.params.Animal_name }, updateData);
        if (result.modifiedCount > 0) {
            res.status(200).json({ "message": "Animal updated successfully" });
        } else {
            res.status(404).json({ "error": "Animal not found or no changes made" });
        }
    } catch (error) {
        console.error("Error updating animal:", error);
        res.status(500).json({ "error": "Internal server error" });
    } finally {
        await client.close();
    }
});

/*
curl -X PUT http://localhost:8099/api/animals/name/<Animal_name> \
     -H "Content-Type: application/json" \
     -d '{
           "Type": "",
           "Animal_name": "",
           "Breed": "",
           "Gender": "",
           "Location": "",
           "Prominent_Features": "",
           "Disabilities": "",
           "Adopted": ""
         }
*/

//DELETE RESTFUL
app.delete('/api/animals/name/:Animal_name', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const result = await deleteDocument(db, { Animal_name: req.params.Animal_name });
        if (result.deletedCount > 0) {
            res.status(200).json({ "message": "Animal deleted successfully" });
        } else {
            res.status(404).json({ "error": "Animal not found" });
        }
    } catch (error) {
        console.error("Error deleting animal:", error);
        res.status(500).json({ "error": "Internal server error" });
    } finally {
        await client.close();
    }
});
// curl -X DELETE http://localhost:8099/api/animals/name/<Animal_name>

// Ends here - Awais & Taha 6:53pm 28/11/2024

app.get('/*', (req, res) => {
	res.status(404).render('information', { message: `${req.path} - Unknown request! `});
});

const port = process.env.PORT || 8099;
app.listen(port, () => {
	console.log(`Listening at http://localhost:${port}`);
});