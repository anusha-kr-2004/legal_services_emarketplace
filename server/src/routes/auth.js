const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = Router();

router.post('/register', async (req, res) => {
	try {
		const { fullName, email, mobile, password, role } = req.body;
		if (!fullName || !email || !mobile || !password) {
			return res.status(400).json({ message: 'Missing required fields' });
		}
		const existing = await User.findOne({ $or: [{ email }, { mobile }] });
		if (existing) return res.status(409).json({ message: 'User already exists' });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await User.create({ fullName, email, mobile, passwordHash, role });
		return res.status(201).json({ id: user._id, email: user.email });
	} catch (err) {
		return res.status(500).json({ message: 'Registration failed' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
		const token = jwt.sign({ sub: user._id.toString(), role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
		return res.json({ token, user: { id: user._id, fullName: user.fullName, role: user.role } });
	} catch (_err) {
		return res.status(500).json({ message: 'Login failed' });
	}
});

router.get('/me', auth(true), async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-passwordHash');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		return res.json({ user });
	} catch (_err) {
		return res.status(500).json({ message: 'Failed to fetch user' });
	}
});

module.exports = router;


