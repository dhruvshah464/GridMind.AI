require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const routes = require('./routes');
const prisma = require('./models');

// ─── Startup Validation ─────────────────────────────────────

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'fallback_secret') {
  console.warn('⚠️  JWT_SECRET not set or is using fallback. Set a strong secret in .env.local');
}

if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not set. Database operations will fail.');
}

// ─── Express App ────────────────────────────────────────────

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', apiLimiter);

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api', routes);

// Health Check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      product: 'GridMind.AI',
      version: '2.0.0',
      db: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DEGRADED',
      product: 'GridMind.AI',
      db: 'Disconnected',
      message: err.message
    });
  }
});

// ─── WebSocket — Real-time Intelligence Feed ────────────────

io.on('connection', (socket) => {
  console.log('[WS] Client connected:', socket.id);

  // Emit real-time energy telemetry with realistic patterns
  const interval = setInterval(() => {
    const hour = new Date().getHours();
    const baseLoad = 15;
    const peakFactor = (hour >= 17 && hour <= 21) ? 25 : (hour >= 7 && hour <= 9) ? 15 : 0;
    const noise = (Math.random() - 0.5) * 5;
    const solarFactor = (hour >= 6 && hour <= 18) ? Math.sin(((hour - 6) / 12) * Math.PI) * 8 : 0;

    socket.emit('energy-update', {
      usage: Math.max(5, baseLoad + peakFactor + noise),
      solar: Math.max(0, solarFactor + (Math.random() - 0.5) * 2),
      timestamp: new Date().toISOString(),
      hour
    });
  }, 3000);

  socket.on('disconnect', () => {
    console.log('[WS] Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

// ─── Graceful Shutdown ──────────────────────────────────────

process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  const { flushDecisions } = require('./services/decisionLogger');
  await flushDecisions();
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

// ─── Start ──────────────────────────────────────────────────

const PORT = process.env.PORT || 5001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n⚡ GridMind.AI Server v2.0.0 running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API:    http://localhost:${PORT}/api\n`);
});
