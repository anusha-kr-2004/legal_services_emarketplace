const Rating = require('../models/Rating');
const LegalService = require('../models/LegalService');
const Booking = require('../models/Booking');
const User = require('../models/User');

exports.addRating = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const citizenId = req.user.id;

    if (!bookingId) return res.status(400).json({ message: 'bookingId is required' });
    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const booking = await Booking.findById(bookingId).populate('service').populate('provider');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.citizen.toString() !== citizenId.toString()) {
      return res.status(403).json({ message: 'You can only rate your own bookings' });
    }
    const rateableStatuses = ['Resolved', 'Closed', 'Completed'];
    if (!rateableStatuses.includes(booking.status)) {
      return res.status(400).json({ message: 'Only resolved bookings can be rated' });
    }
    if (booking.rating) {
      return res.status(409).json({ message: 'Booking already rated' });
    }

    const service = booking.service || (await LegalService.findById(booking.service));
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const providerId =
      (booking.provider && booking.provider._id ? booking.provider._id : booking.provider)?.toString();
    if (!providerId) return res.status(400).json({ message: 'Provider missing on booking' });

    const newRating = await Rating.create({
      service: service._id,
      citizen: citizenId,
      provider: providerId,
      rating: parsedRating,
      comment
    });

    booking.rating = newRating._id;
    await booking.save();

    const ratingPoints = parsedRating * 5;
    await User.findByIdAndUpdate(providerId, { $inc: { points: ratingPoints } });

    res.status(201).json({ message: 'Rating added', rating: newRating });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.getProviderRatings = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const ratings = await Rating.find({ provider: providerId })
      .populate('citizen', 'name')
      .populate('service', 'title')
      .sort({ createdAt: -1 });

    const avgRating = ratings.length
      ? (ratings.reduce((acc, cur) => acc + cur.rating, 0) / ratings.length).toFixed(2)
      : null;

    res.json({ ratings, averageRating: avgRating });
  } catch (error) {
    res.status(500).send('Server error');
  }
};
