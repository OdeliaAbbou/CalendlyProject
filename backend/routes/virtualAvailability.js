//Virtuals Availability
const express = require('express');
const router = express.Router();
const WeekTemplate = require('../models/WeekTemplate'); // Assurez-vous que le chemin est correct
const mongoose = require('mongoose');
const Availability = require('../Availability');

// Définir un adminId par défaut
const defaultAdminId = "67e8405cb9b7cc969cebe12f"; // Remplace par l'adminId par défaut

// Route pour récupérer le modèle de semaine d'un administrateur
router.get('/weekTemplate/:adminId', async (req, res) => {
  const { adminId } = req.params;

  try {
    const template = await WeekTemplate.findOne({ adminId: mongoose.Types.ObjectId(adminId) });
    if (!template) return res.status(404).json({ error: "Modèle de semaine non trouvé" });

    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;

