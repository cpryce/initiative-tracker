const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/initiative-tracker';

async function connectDB() {
  mongoose.connection.on('connected', () => console.log('Connected to MongoDB'));
  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err));
  await mongoose.connect(MONGO_URI);
}

module.exports = connectDB;
