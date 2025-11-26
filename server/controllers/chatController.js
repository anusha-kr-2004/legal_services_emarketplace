const Booking = require('../models/Booking');
const ChatMessage = require('../models/ChatMessage');

const getId = value => {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
};

const ensureParticipant = (booking, userId) => {
  const participantIds = [getId(booking.citizen), getId(booking.provider)].filter(Boolean);
  return participantIds.includes(userId.toString());
};

const isChatUnlocked = booking => {
  return ['Confirmed', 'Resolved', 'Closed', 'Completed'].includes(booking.status);
};

exports.getConversation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId)
      .populate('service', 'title category price')
      .populate('citizen', 'name email')
      .populate('provider', 'name email')
      .populate('rating');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!ensureParticipant(booking, req.user.id)) {
      return res.status(403).json({ message: 'Access denied for this conversation' });
    }
    if (!isChatUnlocked(booking)) {
      return res.status(403).json({ message: 'Chat will activate once the provider accepts this request.' });
    }

    const messages = await ChatMessage.find({ booking: bookingId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name role');

    res.json({ booking, messages });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('citizen', 'name email')
      .populate('provider', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!ensureParticipant(booking, req.user.id)) {
      return res.status(403).json({ message: 'Access denied for this conversation' });
    }
    if (!isChatUnlocked(booking)) {
      return res.status(403).json({ message: 'Chat will activate once the provider accepts this request.' });
    }

    const citizenId = getId(booking.citizen);
    const senderRole = citizenId === req.user.id.toString() ? 'citizen' : 'provider';

    const message = await ChatMessage.create({
      booking: booking._id,
      sender: req.user.id,
      senderRole,
      content: content.trim()
    });

    await message.populate('sender', 'name role');

    const io = req.app.get('io');
    if (io) {
      io.to(booking._id.toString()).emit('chat:new-message', {
        bookingId: booking._id.toString(),
        message
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

