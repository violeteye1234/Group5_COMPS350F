const express = require('express');
const app = express();
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fsPromises = require('fs').promises;

const PORT = process.env.PORT || 8099;
const uri = 'mongodb+srv://kyk123456:031216Kyk@cluster0.pter2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'Animals';
const collectionName = 'animal';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "Group5SecretStr",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Set up Mongoose connection
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongoose Connected!'))
  .catch(err => console.error('Mongoose Connection Error:', err));

// Define Animal schema for MongoDB
const animalSchema = new mongoose.Schema({
  Animal_name: String,
  Type: String,
  Breed: String,
  Gender: String,
  Location: String,
  Prominent_Features: String,
  Disabilities: String,
  Adopted: String,
  Upload_Image: String
});

const Animal = mongoose.model('animal', animalSchema);

// Mock user data for login
const users = [
  { username: 'test1', password: 'abc', admin: false },
  { username: 'admin', password: 'adminpass', admin: true }
];

// Middleware to check if user is logged in
function isLoggedIn(req, res, next) {
  if (req.session.userId || req.session.adminId) {
    next();
  } else {
    res.status(401).json({ message: 'please login first' });
  }
}

// =============================================== CURL LOGIN/LOGOUT ===================================================
app.post('/curl/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = users.find(user => user.username === username);
    if (!user) return res.status(400).json({ message: 'invalid username' });

    if (user.password === password) {
      if (user.admin) {
        req.session.adminId = user.username;
        return res.status(200).json({ message: 'Admin login success' });
      } else {
        req.session.userId = user.username;
        return res.status(200).json({ message: 'User login success' });
      }
    } else {
      return res.status(400).json({ message: 'wrong password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/curl/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.status(200).json({ message: 'logout success' });
  });
});

// =============================================== CURL CRUD OPERATIONS =================================================

// CREATE Animal
app.post('/curl/animals', isLoggedIn, async (req, res) => {
  const { Animal_name, Type, Breed, Gender, Location, Prominent_Features, Disabilities, Adopted } = req.body;

  try {
    const newAnimal = new Animal({
      Animal_name,
      Type,
      Breed,
      Gender,
      Location,
      Prominent_Features,
      Disabilities,
      Adopted
    });

    await newAnimal.save();
    res.status(201).json(newAnimal);
  } catch (err) {
    console.error('Error creating animal:', err);
    res.status(500).json({ message: 'Error creating animal' });
  }
});

// READ All Animals
app.get('/curl/animals', isLoggedIn, async (req, res) => {
  try {
    const animals = await Animal.find();
    res.status(200).json(animals);
  } catch (err) {
    console.error('Error retrieving animals:', err);
    res.status(500).json({ message: 'Error retrieving animals' });
  }
});

// READ Specific Animal
app.get('/curl/animals/name/:Animal_name', isLoggedIn, async (req, res) => {
  try {
    const animal = await Animal.findOne({ Animal_name: req.params.Animal_name });
    if (!animal) return res.status(404).json({ message: 'Animal not found' });

    res.status(200).json(animal);
  } catch (err) {
    console.error('Error retrieving animal:', err);
    res.status(500).json({ message: 'Error retrieving animal' });
  }
});

// UPDATE Animal
app.put('/curl/animals/name/:Animal_name', isLoggedIn, async (req, res) => {
  const { Type, Breed, Gender, Location, Prominent_Features, Disabilities, Adopted } = req.body;

  try {
    const updatedAnimal = await Animal.findOneAndUpdate(
      { Animal_name: req.params.Animal_name },
      { Type, Breed, Gender, Location, Prominent_Features, Disabilities, Adopted },
      { new: true }
    );

    if (!updatedAnimal) return res.status(404).json({ message: 'Animal not found' });

    res.status(200).json(updatedAnimal);
  } catch (err) {
    console.error('Error updating animal:', err);
    res.status(500).json({ message: 'Error updating animal' });
  }
});

// DELETE Animal
app.delete('/curl/animals/name/:Animal_name', isLoggedIn, async (req, res) => {
  try {
    const deletedAnimal = await Animal.findOneAndDelete({ Animal_name: req.params.Animal_name });
    if (!deletedAnimal) return res.status(404).json({ message: 'Animal not found' });

    res.status(200).json({ message: 'Animal deleted successfully', deletedAnimal });
  } catch (err) {
    console.error('Error deleting animal:', err);
    res.status(500).json({ message: 'Error deleting animal' });
  }
});

// =============================================== SERVER SETUP =========================================================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
  console.log('Mongoose Connected!');
});
