const mongoose = require('mongoose');

async function connectToDatabase() {
	const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/legal_emarketplace';
	mongoose.set('strictQuery', true);
	await mongoose.connect(mongoUri, {
		serverSelectionTimeoutMS: 10000,
	});
	console.log('Connected to MongoDB');
}

module.exports = connectToDatabase;



