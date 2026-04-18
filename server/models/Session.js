const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: 'Player' },
  type: { type: String, default: 'player' },
  modifier: { type: Number, default: 0 },
}, { _id: false });

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, trim: true },
  players: { type: [PlayerSchema], default: [] },
  lastAccessed: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
