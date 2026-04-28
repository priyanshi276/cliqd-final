const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
// app.use(cors({
//   // origin: [
//   //   "http://localhost:3000",
//   //   "https://cliqd-final.vercel.app"
//   // ],
//   // NAYA
// origin: ['http://localhost:3000', 'https://cliqd-final-production.up.railway.app'],
//   credentials: true
// }));
app.use(express.json({ limit: '20mb' }));       // allow base64 images
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── MongoDB Connection ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cliqd')
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => {
    console.error('❌  MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/posts',  require('./routes/posts'));
app.use('/api/social', require('./routes/social'));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

// ── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (_req, res) =>
    res.sendFile(path.join(__dirname, '../client/build/index.html'))
  );
}

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀  Server running on http://localhost:${PORT}`));


// const path = require('path');

// // Pehle se existing code ke neeche, routes ke baad yeh add karo:

// // Serve React frontend in production
// app.use(express.static(path.join(__dirname, '../dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../dist', 'index.html'));
// });
