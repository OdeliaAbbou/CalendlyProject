const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const WeekTemplate = require('../models/WeekTemplate');
const Availability = require('../Availability');

// 🛠️ Outil pour générer les dates entre deux bornes
function getDateRange(start, end) {
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// 🎯 Route POST : Génération des créneaux en fonction des heures précises
router.post('/', async (req, res) => {
  const { adminId, from, to } = req.body;

  try {
    if (!adminId || !from || !to) {
      return res.status(400).json({ error: 'adminId, from et to sont requis.' });
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const template = await WeekTemplate.findOne({ adminId: new mongoose.Types.ObjectId(adminId) });
    if (!template) {
      return res.status(404).json({ error: 'Aucun modèle trouvé pour cet admin.' });
    }

    const days = getDateRange(fromDate, toDate);
    const toInsert = [];

    for (const day of days) {
      const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
      const hours = template.availability[dayName]; // Ex: ["08:00", "09:00"]

      if (Array.isArray(hours)) {
        for (const hour of hours) {
          const dateStr = day.toISOString().split('T')[0];
          toInsert.push({ date: dateStr, time: hour });
        }
      }
    }

    if (toInsert.length > 0) {
      const result = await Availability.bulkWrite(
        toInsert.map((slot) => ({
          updateOne: {
            filter: { date: slot.date, time: slot.time },
            update: slot,
            upsert: true,
          },
        }))
      );
      res.json({ message: 'Créneaux générés avec succès', count: result.upsertedCount });
    } else {
      res.json({ message: 'Aucun créneau généré, vérifiez les heures disponibles.' });
    }

  } catch (err) {
    console.error('Erreur génération slots :', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
