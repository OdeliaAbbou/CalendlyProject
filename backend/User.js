
//user
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'visitor'], default: 'visitor' },
    nom: { type: String },
    prenom: { type: String },
    telephone: { type: String },
    adresse: { type: String }
});

module.exports = mongoose.model('User', userSchema);
