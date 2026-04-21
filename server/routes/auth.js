const express = require('express');
const passport = require('passport');

const router = express.Router();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
}));

router.get('/google/callback',
  (req, res, next) => {
    console.log('[auth] /google/callback hit');
    next();
  },
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    console.log('[auth] /google/callback post-auth — isAuthenticated:', req.isAuthenticated());
    console.log('[auth] /google/callback post-auth — req.user:', req.user);
    res.redirect(CLIENT_URL);
  }
);

router.get('/me', (req, res) => {
  console.log('[auth] /me — isAuthenticated:', req.isAuthenticated());
  console.log('[auth] /me — req.user:', req.user);
  console.log('[auth] /me — session ID:', req.session?.id);
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  return res.status(401).json({ user: null });
});

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie('connect.sid');
      res.json({ success: true });
    });
  });
});

module.exports = router;
