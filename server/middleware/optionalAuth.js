const jwt = require('jsonwebtoken');

function optionalAuth(req, _res, next) {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = payload;
  } catch (_err) {
    // ignore invalid token and continue unauthenticated
  }

  next();
}

module.exports = optionalAuth;






