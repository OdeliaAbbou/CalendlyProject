//avaiablility
// 
const mongoose = require('mongoose');

// Structure d'un créneau
const availabilitySchema = new mongoose.Schema({
  date: {
    type: String,   
    required: true
  },
  time: {
    type: String,   
    required: true
  },
  isBooked: {
    type: Boolean, 
    default: false
  },
  bookedBy: { type: String, default: '' },

});

module.exports = mongoose.model('Availability', availabilitySchema);
