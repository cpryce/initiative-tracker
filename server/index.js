require('dotenv').config();

// Suppress known DEP0169 url.parse() warning from passport-google-oauth20 dependency chain
// Suppress Mongoose false-positive 'new option deprecated' warning (we already use returnDocument)
const originalEmit = process.emit.bind(process);
process.emit = function (event, warning, ...args) {
  if (event === 'warning' && warning?.name === 'DeprecationWarning' && warning?.code === 'DEP0169') {
    return false;
  }
  if (event === 'warning' && warning?.name === 'MongooseWarning' && warning?.message?.includes("'new' option")) {
    return false;
  }
  return originalEmit(event, warning, ...args);
};

const express = require('express');
const cors = require('cors');
const session = require('express-session');
let MongoStore;
if (process.env.NODE_ENV === 'production') {
  MongoStore = require('connect-mongo');
}
const passport = require('passport');

require('./auth/passport');

const connectDB = require('./db');
const authRouter = require('./routes/auth');
const sessionsRouter = require('./routes/sessions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: process.env.NODE_ENV === 'production'
    ? MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
    : undefined,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/api/sessions', sessionsRouter);

if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
