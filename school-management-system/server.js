// server.js  –  Entry point
require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

// Route imports
const studentRoutes    = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const resultRoutes     = require('./routes/resultRoutes');
const feeRoutes        = require('./routes/feeRoutes');

// Initialize DB pool (side-effect: verifies connection)
require('./config/db');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────
app.use('/api/students',   studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/results',    resultRoutes);
app.use('/api/fees',       feeRoutes);

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── SPA fallback (serves index.html for any unknown route) ──
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Global error handler ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  School Management System running on http://localhost:${PORT}`);
  console.log(`📂  Environment: ${process.env.NODE_ENV}`);
});
