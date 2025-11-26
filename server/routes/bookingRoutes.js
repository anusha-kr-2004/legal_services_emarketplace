const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, bookingController.createBooking);
router.get('/my-bookings', authMiddleware, bookingController.getUserBookings);
router.put('/:id/status', authMiddleware, bookingController.updateBookingStatus);

module.exports = router;
