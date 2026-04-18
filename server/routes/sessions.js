const express = require('express');
const Session = require('../models/Session');

const router = express.Router();
const MAX_SESSIONS = 5;

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function toDTO(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    players: doc.players || [],
    lastAccessed: doc.lastAccessed,
    createdAt: doc.createdAt,
  };
}

// List sessions sorted by lastAccessed desc
router.get('/', requireAuth, async (req, res) => {
  const sessions = await Session.find({ userId: req.user.id })
    .sort({ lastAccessed: -1 })
    .lean();
  res.json(sessions.map(toDTO));
});

// Create session (max 5 per user)
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Session name is required' });
  const count = await Session.countDocuments({ userId: req.user.id });
  if (count >= MAX_SESSIONS) {
    return res.status(400).json({
      error: `Maximum of ${MAX_SESSIONS} sessions reached. Delete one to create a new session.`,
    });
  }
  const session = await Session.create({
    userId: req.user.id,
    name: name.trim(),
    players: [],
  });
  res.status(201).json(toDTO(session));
});

// Get single session — updates lastAccessed
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { lastAccessed: new Date() },
      { returnDocument: 'after' }
    ).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(toDTO(session));
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Update session — only persists name and player roster
router.put('/:id', requireAuth, async (req, res) => {
  const { name, players } = req.body;
  const update = {};
  if (name !== undefined) update.name = name.trim();
  if (players !== undefined) update.players = players;
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { returnDocument: 'after' }
    ).lean();
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(toDTO(session));
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

// Delete session
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await Session.deleteOne({ _id: req.params.id, userId: req.user.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true });
  } catch {
    res.status(404).json({ error: 'Session not found' });
  }
});

module.exports = router;
