// backend/app.js - robust server with session + compatible connect-mongo usage
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const app = express();
const port = process.env.PORT || 4000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dbt_portal_demo';

<<<<<<< HEAD
async function createMongoConnection() {
=======
mongoose.connect(MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(()=>console.log('Connected to MongoDB'))
  .catch(err=>console.error('MongoDB connection error',err));

// Routes - keep modular
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/admin', require('./routes/admin'));
// Scam reports route
app.use('/api/scams', require('./routes/scams'));
app.use('/api/teachers', require('./routes/teachers'));
// Parents route
app.use('/api/parents', require('./routes/parents'));
app.use('/api/ptm', require('./routes/ptm'));
// Meetings route (scheduling, joining, attendance)
app.use('/api/meetings', require('./routes/meetings'));

// Simple stats endpoint for frontend counters
app.get('/api/stats', async (req,res)=>{
  // In a real app, compute from DB. Return dummy for demo.
  res.json({totalStudents:1200, dbtEnabled:842, volunteers:56, annualAmount:'₹12,40,000'});
});

// Visitor count endpoint
app.get('/api/visitor-count', async (req, res) => {
>>>>>>> 350b87a236a98902fb5dbdb3d446ab7e2ef6bb92
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    console.log('Proceeding without MongoDB (demo mode). Some features relying on DB will be degraded.');
    return false;
  }
}



// Create session store in a way that supports multiple connect-mongo versions
function createSessionStore(mongoConnected) {
  if (!mongoConnected) {
    // fallback: memory store (not for production)
    console.warn('Using MemoryStore for sessions (demo). Not suitable for production.');
    return new session.MemoryStore();
  }

  // Try to require connect-mongo and support different exports/APIs
  try {
    const MongoStorePkg = require('connect-mongo');

    // 1) Preferred: modern API (v4+, v5): MongoStore.create(...)
    if (MongoStorePkg && typeof MongoStorePkg.create === 'function') {
      return MongoStorePkg.create({
        mongoUrl: MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 // 14 days
      });
    }

    // 2) Some older versions export function that needs to be invoked with session
    if (typeof MongoStorePkg === 'function') {
      // connect-mongo v2/v3 style: require('connect-mongo')(session)
      const StoreCtor = MongoStorePkg(session);
      // For old versions the option key is often 'url' or 'mongooseConnection' — try url
      try {
        return new StoreCtor({
          url: MONGO_URI,
          collection: 'sessions',
          ttl: 14 * 24 * 60 * 60
        });
      } catch (err) {
        // try mongoose connection object fallback
        return new StoreCtor({
          mongooseConnection: mongoose.connection,
          collection: 'sessions',
          ttl: 14 * 24 * 60 * 60
        });
      }
    }

    // 3) Some environments may have default under .default (ES module interop)
    if (MongoStorePkg && MongoStorePkg.default && typeof MongoStorePkg.default.create === 'function') {
      return MongoStorePkg.default.create({
        mongoUrl: MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60
      });
    }

    console.warn('connect-mongo found but API not recognized — using MemoryStore fallback.');
    return new session.MemoryStore();
  } catch (err) {
    console.warn('connect-mongo not installed or failed to load:', err.message || err);
    console.warn('Using MemoryStore for sessions (demo). Install connect-mongo for persistent sessions.');
    return new session.MemoryStore();
  }
}

(async () => {
  const mongoConnected = await createMongoConnection();

  const sessionStore = createSessionStore(mongoConnected);

  app.use(session({
    secret: process.env.SESSION_SECRET || 'dbt_demo_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 } // 14 days
  }));

  // Helper to mount routes safely
  const safeUse = (routePath, mountPath) => {
    try {
      const r = require(routePath);
      app.use(mountPath, r);
      console.log(`Mounted ${mountPath} -> ${routePath}`);
    } catch (err) {
      console.warn(`Could not mount ${mountPath} (${routePath}): ${err.message}`);
    }
  };

  // Mount commonly used routes if they exist
  safeUse('./routes/students', '/api/students');
  safeUse('./routes/teachers', '/api/teachers');
  safeUse('./routes/volunteers', '/api/volunteers');
  safeUse('./routes/admin', '/api/admin');
  safeUse('./routes/scams', '/api/scams');
  safeUse('./routes/campaigns', '/api/campaigns');
  safeUse('./routes/heatmapRoutes', '/api/heatmap');
  safeUse('./routes/Meeting', '/api/meeting'); // depending on file name

  // Simple health & test endpoints
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      server: 'DBT Portal Backend',
      port,
      timestamp: new Date().toISOString(),
      mongoConnected: mongoose.connection.readyState === 1
    });
  });

  app.get('/api/test-endpoints', (req, res) => {
    res.json({
      server: 'DBT Portal API',
      baseUrl: `http://localhost:${port}`,
      available: [
        '/api/health',
        '/api/test-endpoints',
        '/api/students (if mounted)'
      ]
    });
  });

  // SPA fallback
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found', path: req.path });
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '..', 'frontend')}`);
  });
})();