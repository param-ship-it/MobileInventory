'use strict';
require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Server } = require('socket.io');

const db = require('./db/pool');
const { initTables } = require('./db/init');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] }
});

// ── Security & Middleware ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP disabled — SPA serves its own
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

// Attach socket.io to req so routes can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/devices',     require('./routes/devices'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/reports',     require('./routes/reports'));
app.use('/api/users',       require('./routes/users'));
app.use('/api/programs',    require('./routes/programs'));

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Serve Ionic SPA (after npm run build in webapp/) ──────────────────────
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// ── Socket.io — real-time activity feed ───────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 Client disconnected: ${socket.id}`));
});

// ── Bootstrap ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await db.initialize();
    await initTables();
  } catch (err) {
    console.warn('⚠️  Oracle DB unavailable — server starting without DB. API endpoints will fail until DB is reachable.');
    console.warn('   Error:', err.message);
  }
  server.listen(PORT, () => {
    console.log(`\n🚀 Mobile Inventory Server running on http://localhost:${PORT}`);
    console.log(`   API:    http://localhost:${PORT}/api/health`);
    console.log(`   App:    http://localhost:${PORT}/\n`);
  });
})();

process.on('SIGTERM', async () => { await db.close(); process.exit(0); });
process.on('SIGINT',  async () => { await db.close(); process.exit(0); });
