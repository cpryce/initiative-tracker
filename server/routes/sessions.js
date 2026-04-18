const express = require('express');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// In-memory store keyed by userId -> sessions map
const store = new Map();

function getUserSessions(userId) {
  if (!store.has(userId)) store.set(userId, new Map());
  return store.get(userId);
}

// List all sessions for logged-in user
router.get('/', requireAuth, (req, res) => {
  const sessions = getUserSessions(req.user.id);
  res.json(Array.from(sessions.values()));
});

// Create new encounter session
router.post('/', requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Session name is required' });
  }
  const sessions = getUserSessions(req.user.id);
  const session = {
    id: uuidv4(),
    name: name.trim(),
    combatants: [],
    round: 1,
    createdAt: new Date().toISOString(),
  };
  sessions.set(session.id, session);
  res.status(201).json(session);
});

// Get single session
router.get('/:id', requireAuth, (req, res) => {
  const sessions = getUserSessions(req.user.id);
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  res.json(session);
});

// Update session (combatants, round, etc.)
router.put('/:id', requireAuth, (req, res) => {
  const sessions = getUserSessions(req.user.id);
  const session = sessions.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const { combatants, round, name } = req.body;
  if (name !== undefined) session.name = name.trim();
  if (round !== undefined) session.round = round;
  if (combatants !== undefined) session.combatants = combatants;

  res.json(session);
});

// Delete session
router.delete('/:id', requireAuth, (req, res) => {
  const sessions = getUserSessions(req.user.id);
  if (!sessions.has(req.params.id)) return res.status(404).json({ error: 'Session not found' });
  sessions.delete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
