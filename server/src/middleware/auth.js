const jwt = require('jsonwebtoken');

function auth(required = true) {
	return (req, res, next) => {
		const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
		if (!token) {
			if (required) return res.status(401).json({ message: 'Unauthorized' });
			return next();
		}
		try {
			const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
			req.user = { id: payload.sub, role: payload.role };
			return next();
		} catch (_err) {
			if (required) return res.status(401).json({ message: 'Invalid token' });
			return next();
		}
	};
}

module.exports = auth;



