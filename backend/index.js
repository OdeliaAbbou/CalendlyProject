//index json
const Availability = require('./Availability');
require('dotenv').config(); // Lire le fichier .env
const auth = require('./auth');
const WeekTemplate = require('./models/WeekTemplate');


const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
const cors = require('cors');

// Active CORS pour toutes les routes
app.use(cors());


app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connecté à MongoDB Atlas'))
.catch((err) => console.error('Erreur MongoDB:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Backend Calendly connecté à MongoDB 🎉');
});

// Ajouter un créneau
app.post('/api/availabilities', auth('admin'), async (req, res) => {
  const { date, time } = req.body;

  try {
    const newSlot = new Availability({ date, time });
    await newSlot.save();
    res.status(201).json(newSlot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//tt les creneau deja pris
app.get('/api/availabilities', async (req, res) => {
  const { date } = req.query;

  // Nettoyage de la date (en cas d'espace ou valeur vide)
  const cleanDate = date ? date.trim() : null;
  const filter = cleanDate ? { date: cleanDate } : {}; // Si une date est donnée, on filtre sur cette date

  try {
    const slots = await Availability.find(filter); // Recherche des créneaux avec la date filtrée
    res.json(slots); // Retour des créneaux
  } catch (err) {
    res.status(500).json({ error: err.message }); // En cas d'erreur, on retourne le message d'erreur
  }
});



// Modifier un créneau (date et/ou heure)
app.put('/api/availabilities/book/:id', async (req, res) => {
  const { id } = req.params;
  const { visitorName } = req.body;

  try {
    const updated = await Availability.findByIdAndUpdate(
      id,
      { isBooked: true, bookedBy: visitorName },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Créneau non trouvé' });
    }

    console.log(`📢 RDV pris le ${updated.date} à ${updated.time} par ${visitorName}`);
    res.json({ message: 'RDV réservé avec succès', updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// // Modifier un créneau (date et/ou heure)
// app.put('/api/availabilities/:id',auth('admin'), async (req, res) => {
//   const { id } = req.params;
//   const { date, time } = req.body;

//   try {
//     const updated = await Availability.findByIdAndUpdate(
//       id,
//       { date, time },
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ error: 'Créneau non trouvé' });
//     }

//     res.json({ message: 'Créneau mis à jour avec succès', updated });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Ajouter un créneau
app.post('/api/availabilities/book', async (req, res) => {
  const { date, time, visitorName } = req.body;

  // Vérification que tous les champs sont fournis
  if (!date || !time || !visitorName) {
    return res.status(400).json({ error: 'Tous les champs sont requis (date, time, visitorName)' });
  }

  try {
    // Vérifier si un créneau existe déjà à cette date et heure
    // const existingSlot = await Availability.findOne({ date, time });

    // if (existingSlot) {
    //   return res.status(400).json({ error: 'Ce créneau est déjà réservé.' });
    // }

    // Création d'un nouveau créneau
    const newSlot = new Availability({
      date,
      time,
      isBooked: true,  // Marquer comme réservé
      bookedBy: visitorName  // Nom de la personne qui réserve le créneau
    });

    // Sauvegarder le créneau dans la base de données
    await newSlot.save();

    // Répondre avec un message de confirmation
    console.log(`📢 RDV réservé le ${newSlot.date} à ${newSlot.time} par ${visitorName}`);
    res.status(201).json({ message: 'RDV réservé avec succès', newSlot });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Supprimer un créneau
app.delete('/api/availabilities/:id',auth('admin'), async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Availability.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Créneau non trouvé' });
    }
    res.json({ message: 'Créneau supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./User');

// Enregistrement d’un nouvel utilisateur
app.post('/api/users/register', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Connexion utilisateur
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Connexion réussie', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // cache les mots de passe
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.use('/api/availabilities/generate', require('./routes/generateSlots'));
app.use('/api/templates', require('./routes/templates'));
//app.use('/api/availabilities', require('./routes/virtualAvailability'));
app.use('/api/weekTemplate', require('./routes/templates'));


app.listen(port, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${port}`);
});
