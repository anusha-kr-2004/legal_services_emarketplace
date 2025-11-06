const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const connectToDatabase = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_ORIGIN || '*',
		credentials: true,
	},
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Healthcheck
app.get('/health', (_req, res) => {
	return res.json({ status: 'ok', service: 'legal-emarketplace-api' });
});

// Routes
app.use('/api/auth', require('./routes/auth')); // basic auth routes placeholder

// WebSocket basic setup
io.on('connection', (socket) => {
	// Reserve for real-time updates like chat/notifications
	socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;

async function start() {
	await connectToDatabase();
	server.listen(PORT, () => {
		console.log(`API listening on port ${PORT}`);
	});
}

start().catch((err) => {
	console.error('Failed to start server', err);
	process.exit(1);
});



