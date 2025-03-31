
//weektemplate
const mongoose = require('mongoose');

const weekTemplateSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  availability: {
    type: Object, // Ex: { Monday: ["09:00", "10:00"] }
    required: true,
  },
}, { timestamps: true });


// Définition du modèle WeekTemplate
const WeekTemplate = mongoose.model('WeekTemplate', weekTemplateSchema);

// Exportation du modèle
module.exports = WeekTemplate;
