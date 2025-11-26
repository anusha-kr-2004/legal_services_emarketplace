const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsConfig = {
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true
};

app.use(cors(corsConfig));
app.use(express.json());

// Import routes
const userRoutes = require('./routes/userRoutes');
const legalServiceRoutes = require('./routes/legalServiceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const chatRoutes = require('./routes/chatRoutes');

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'legal-emarketplace-api' });
});

app.use('/api/users', userRoutes);
app.use('/api/services', legalServiceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/chat', chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsConfig
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Unauthorized'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', socket => {
  socket.on('joinBooking', bookingId => {
    if (bookingId) {
      socket.join(bookingId);
    }
  });
});

app.set('io', io);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error('Missing MONGO_URI or MONGODB_URI environment variable');
    }
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Server failed to start', err);
    process.exit(1);
  }
}

start();
