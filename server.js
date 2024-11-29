const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB URI
const uri = "mongodb+srv://kyk123456:031216Kyk@cluster0.pter2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// View Engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'animal_secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// Animal Schema and Model
const animalSchema = new mongoose.Schema({
  name: String,
  type: String,
  breed: String,
  gender: String,
  location: String,
  features: String,
  disabilities: String,
  adopted: Boolean,
});

const Animal = mongoose.model('Animal', animalSchema);

// User Schema and Model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  admin: Boolean,
});

const User = mongoose.model('User', userSchema);

// =============================================== ROUTES =======================================================

// Redirect to Login Page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.send('Invalid Username');

    if (password === user.password) {
      if (user.admin) {
        req.session.adminId = user._id;
        return res.redirect('/adminHome');
      } else {
        req.session.userId = user._id;
        return res.redirect('/userHome');
      }
    } else {
      return res.send('Wrong password');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Error logging in: ' + err.message);
  }
});

// User Home Page
app.get('/userHome', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.render('userHome');
});

// Admin Home Page
app.get('/adminHome', (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }
  res.render('adminHome');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.redirect('/login');
    res.redirect('/login');
  });
});

// =============================================== CRUD ROUTES ==================================================

// Show All Animals
app.get('/animals', async (req, res) => {
  if (!req.session.userId && !req.session.adminId) {
    return res.redirect('/login');
  }

  try {
    const animals = await Animal.find();
    res.render('animals', { animals });
  } catch (err) {
    console.error('Error fetching animals:', err);
    res.status(500).send('Error fetching animals');
  }
});

// Create Animal Page
app.get('/animals/create', (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }
  res.render('createAnimal');
});

// Handle Animal Creation
app.post('/animals', async (req, res) => {
  const { name, type, breed, gender, location, features, disabilities, adopted } = req.body;

  try {
    const newAnimal = new Animal({
      name,
      type,
      breed,
      gender,
      location,
      features,
      disabilities,
      adopted: adopted === 'true',
    });
    await newAnimal.save();
    res.redirect('/animals');
  } catch (err) {
    console.error('Error creating animal:', err);
    res.status(500).send('Error creating animal: ' + err.message);
  }
});

// Update Animal Page
app.get('/animals/update/:id', async (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }

  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).send('Animal not found');
    res.render('updateAnimal', { animal });
  } catch (err) {
    console.error('Error fetching animal:', err);
    res.status(500).send('Error fetching animal');
  }
});

// Handle Animal Update
app.put('/animals/:id', async (req, res) => {
  const { name, type, breed, gender, location, features, disabilities, adopted } = req.body;

  try {
    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        breed,
        gender,
        location,
        features,
        disabilities,
        adopted: adopted === 'true',
      },
      { new: true }
    );

    if (!updatedAnimal) return res.status(404).send('Animal not found');
    res.redirect('/animals');
  } catch (err) {
    console.error('Error updating animal:', err);
    res.status(500).send('Error updating animal');
  }
});

// Delete Animal
app.delete('/animals/:id', async (req, res) => {
  if (!req.session.adminId) {
    return res.redirect('/login');
  }

  try {
    const deletedAnimal = await Animal.findByIdAndDelete(req.params.id);
    if (!deletedAnimal) return res.status(404).send('Animal not found');
    res.redirect('/animals');
  } catch (err) {
    console.error('Error deleting animal:', err);
    res.status(500).send('Error deleting animal');
  }
});

// =============================================== CURL API =====================================================

// Login via API
app.post('/curl/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid username' });

    if (password === user.password) {
      if (user.admin) {
        req.session.adminId = user._id;
        return res.status(200).json({ message: 'Admin login success' });
      } else {
        req.session.userId = user._id;
        return res.status(200).json({ message: 'User login success' });
      }
    } else {
      return res.status(400).json({ message: 'Wrong password' });
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Logout via API
app.post('/curl/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.status(200).json({ message: 'Logout success' });
  });
});

// CRUD API for Animals
app.post('/curl/animals', async (req, res) => {
  try {
    const newAnimal = new Animal(req.body);
    await newAnimal.save();
    res.status(201).json(newAnimal);
  } catch (err) {
    console.error('Error creating animal:', err);
    res.status(500).json({ message: 'Error creating animal' });
  }
});

app.get('/curl/animals', async (req, res) => {
  try {
    const animals = await Animal.find();
    res.status(200).json(animals);
  } catch (err) {
    console.error('Error fetching animals:', err);
    res.status(500).json({ message: 'Error fetching animals' });
  }
});

app.get('/curl/animals/:id', async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id);
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.status(200).json(animal);
  } catch (err) {
    console.error('Error fetching animal:', err);
    res.status(500).json({ message: 'Error fetching animal' });
  }
});

app.put('/curl/animals/:id', async (req, res) => {
  try {
    const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedAnimal) return res.status(404).json({ message: 'Animal not found' });
    res.status(200).json(updatedAnimal);
  } catch (err) {
    console.error('Error updating animal:', err);
    res.status(500).json({ message: 'Error updating animal' });
  }
});

app.delete('/curl/animals/:id', async (req, res) => {
  try {
    const deletedAnimal = await Animal.findByIdAndDelete(req.params.id);
    if (!deletedAnimal) return res.status(404).json({ message: 'Animal not found' });
    res.status(200).json({ message: 'Animal deleted', deletedAnimal });
  } catch (err) {
    console.error('Error deleting animal:', err);
    res.status(500).json({ message: 'Error deleting animal' });
  }
});

// =============================================== CONNECT TO DB AND START SERVER ===================================
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Mongoose Connected!');
    });
  })
  .catch(err => console.log('Mongoose Connection Error:', err));
