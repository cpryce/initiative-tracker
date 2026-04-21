const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
}, (_accessToken, _refreshToken, profile, done) => {
  console.log('[passport] Google profile received:', JSON.stringify(profile, null, 2));

  const user = {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.emails?.[0]?.value,
    avatar: profile.photos?.[0]?.value,
  };

  console.log('[passport] User object created:', user);

  done(null, user);
  console.log('[passport] done(null, user) called for:', user.id);
  return;
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
