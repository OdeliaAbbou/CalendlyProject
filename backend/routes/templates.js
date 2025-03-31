//templates
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const WeekTemplate = require('../models/WeekTemplate');

router.post('/', async (req, res) => {
  const { adminId, availability } = req.body;
  if (!adminId || !availability) {
    return res.status(400).json({ error: 'adminId et availability sont requis.' });
  }

  await WeekTemplate.deleteOne({ adminId });
  const template = new WeekTemplate({ adminId, availability });
  await template.save();

  res.status(201).json({ message: 'Modèle enregistré avec succès', template });
});

// Route GET : Récupérer les horaires pour un jour donné depuis le WeekTemplate
router.get('/:adminId/:date', async (req, res) => {
  console.log('🔍 Requête reçue pour adminId =', req.params.adminId, 'et date =', req.params.date);

  const { adminId, date } = req.params;

  try {
    const template = await WeekTemplate.findOne({adminId: new mongoose.Types.ObjectId(adminId)
    });

    if (!template) {
      return res.status(404).json({ error: 'Modèle non trouvé pour cet admin.' });
    }

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const availability = template.availability?.[dayName] || [];

    res.json({ dayOfWeek: dayName, availability });
  } catch (err) {
    console.error('Erreur GET WeekTemplate :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;
