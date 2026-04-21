require('dotenv').config({ path: require('path').join(__dirname, '.env') });

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

connectDB().then(() => {
  let store;
  if (process.env.NODE_ENV === 'production') {
    console.log('[session] Creating MongoStore with MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'NOT SET');
    store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
    console.log('[session] MongoStore created successfully');
    store.on('error', (err) => console.error('[session] MongoStore error:', err));
    store.on('set', (sessionId) => console.log('[session] MongoStore saving session:', sessionId));
  }

  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: true,
    store,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    genid: (req) => {
      const id = require('crypto').randomBytes(16).toString('hex');
      console.log('[session] Generated new session ID:', id);
      return id;
    },
  }));

  app.use((req, res, next) => {
    const originalSetHeader = res.setHeader;
    res.setHeader = function(name, value) {
      if (name.toLowerCase() === 'set-cookie') {
        console.log('[session] Setting cookie:', value);
      }
      return originalSetHeader.call(this, name, value);
    };
    next();
  });

  app.use((req, _res, next) => {
    console.log('[session] sessionID:', req.sessionID, '| session:', JSON.stringify(req.session));
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/auth', authRouter);
  app.use('/api/sessions', sessionsRouter);

  if (process.env.NODE_ENV === 'production') {
    const path = require('path');
    app.use(express.static(path.join(__dirname, '../client/dist')));
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
        return res.status(404).json({ error: 'Not found' });
      }
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
