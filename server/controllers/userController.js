const User = require('../models/User');
const Booking = require('../models/Booking');
const LegalService = require('../models/LegalService');
const Rating = require('../models/Rating');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const providerRoles = ['advocate', 'mediator', 'arbitrator', 'notary', 'document_writer'];

const buildSafeUser = user => ({
  id: user._id,
  name: user.name,
  fullName: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  points: user.points,
  badges: user.badges
});

// Registration
exports.register = async (req, res) => {
  const { name, fullName, email, password, role = 'citizen', mobile } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const normalizedRole = (role || 'citizen').toLowerCase();
    const allowedRoles = ['citizen', ...providerRoles];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role supplied' });
    }

    const displayName = (fullName || name || '').trim();
    if (!displayName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: displayName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      mobile: mobile?.trim()
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id.toString(), role: newUser.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: buildSafeUser(newUser)
    });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: '7d' }
    );
    res.json({ token, user: buildSafeUser(user) });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: buildSafeUser(user) });
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Role-based Dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = (req.user.role || '').toLowerCase();

    if (role === 'citizen') {
      const bookings = await Booking.find({ citizen: userId })
        .populate('service')
        .populate('provider', 'name email')
        .sort({ createdAt: -1 });
      return res.json({ bookings });
    } else if (providerRoles.includes(role)) {
      const user = await User.findById(userId);
      const services = await LegalService.find({ provider: userId });
      const bookings = await Booking.find({ provider: userId })
        .populate('service')
        .populate('citizen', 'name email')
        .sort({ createdAt: -1 });
      const ratings = await Rating.find({ provider: userId });
      const avgRating = ratings.length > 0
        ? (ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length).toFixed(2)
        : null;
      return res.json({
        services,
        bookings,
        avgRating,
        points: user.points,
        badges: user.badges
      });
    } else {
      return res.status(403).json({ message: 'Role not authorized' });
    }
  } catch (error) {
    res.status(500).send('Server error');
  }
};

// Leaderboard (Gamification)
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: { $in: providerRoles } })
      .sort({ points: -1 })
      .limit(10)
      .select('name role points badges');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).send('Server error');
  }
};
