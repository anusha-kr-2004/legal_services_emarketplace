const Booking = require('../models/Booking');
const LegalService = require('../models/LegalService');
const User = require('../models/User');

exports.createBooking = async (req, res) => {
  try {
    const { serviceId, bookingDate } = req.body;
    const citizenId = req.user.id;

    const service = await LegalService.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    if (!bookingDate) {
      return res.status(400).json({ message: 'Booking date is required' });
    }

    const parsedDate = new Date(bookingDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid booking date' });
    }

    const newBooking = new Booking({
      service: service._id,
      citizen: citizenId,
      provider: service.provider,
      bookingDate: parsedDate,
      status: 'Pending'
    });

    await newBooking.save();
    res.status(201).json({ message: 'Booking created', booking: newBooking });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = (req.user.role || '').toLowerCase();

    let bookings;
    if (userRole === 'citizen') {
      bookings = await Booking.find({ citizen: userId })
        .populate('service')
        .populate('provider', 'name email')
        .populate('citizen', 'name email')
        .populate('rating')
        .sort({ createdAt: -1 });
    } else if (['advocate', 'mediator', 'arbitrator', 'notary', 'document_writer'].includes(userRole)) {
      bookings = await Booking.find({ provider: userId })
        .populate('service')
        .populate('citizen', 'name email')
        .populate('provider', 'name email')
        .populate('rating')
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(bookings);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Confirmed', 'Resolved', 'Closed', 'Cancelled', 'Completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status supplied' });
    }

    const booking = await Booking.findById(req.params.id).populate('rating');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.provider.toString() !== req.user.id)
      return res.status(403).json({ message: 'User not authorized' });

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking status updated to ${status}`, booking });
  } catch (error) {
    res.status(500).send('Server error');
  }
};
