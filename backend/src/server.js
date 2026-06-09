const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const { Pool } = require('pg');
const redis = require('redis');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/uploads');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000' }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis connection refused');
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('[v0] Redis connected'));

// Attach to app for access in routes
app.locals.db = pool;
app.locals.redis = redisClient;
app.locals.io = io;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('[v0] User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('[v0] User disconnected:', socket.id);
  });
  
  socket.on('subscribe-orders', (userId) => {
    socket.join(`user-${userId}`);
  });
  
  socket.on('subscribe-admin', () => {
    socket.join('admin');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[v0] Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[v0] Server running on port ${PORT}`);
  console.log(`[v0] Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io, pool, redisClient };
