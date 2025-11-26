const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'LegalService', required: true },
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookingDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Resolved', 'Closed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  rating: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating', default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
