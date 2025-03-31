
//time slots
const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },  // format "2025-04-01"
  time: { type: String, required: true },  // format "09:00"
  isBooked: { type: Boolean, default: false },
  bookedBy: { type: String, default: '' }
});

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
