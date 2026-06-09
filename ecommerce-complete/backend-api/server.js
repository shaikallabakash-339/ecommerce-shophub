require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      process.env.CUSTOMER_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001'
    ],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    process.env.CUSTOMER_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce'
});

// Redis Connection
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379
  }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect().catch(err => console.log('Redis connection error', err));

// Routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/uploads');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payments');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  res.json({
    service: 'ShopHub API',
    version: '1.0',
    status: 'ready',
    health: '/health',
    api: '/api/health'
  });
});

app.get('/api', (req, res) => {
  res.json({
    api: 'ShopHub API',
    endpoints: [
      '/api/auth',
      '/api/products',
      '/api/cart',
      '/api/orders',
      '/api/uploads',
      '/api/admin',
      '/api/payments'
    ]
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io events
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
  
  socket.on('productUpdated', (data) => {
    io.emit('productUpdated', data);
  });
  
  socket.on('orderCreated', (data) => {
    io.emit('orderCreated', data);
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Store pool and redis for use in routes
module.exports = { app, pool, redisClient, io };
