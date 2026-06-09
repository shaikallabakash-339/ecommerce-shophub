const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL Connection Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ecommerce_db'
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[ERROR] Database connection failed:', err.message);
  } else {
    console.log('[SUCCESS] Connected to PostgreSQL database');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth')(pool));
app.use('/api/products', require('./routes/products')(pool));
app.use('/api/cart', require('./routes/cart')(pool));
app.use('/api/orders', require('./routes/orders')(pool));
app.use('/api/payments', require('./routes/payments')(pool));
app.use('/api/admin', require('./routes/admin')(pool));
app.use('/api/uploads', require('./routes/uploads')(pool));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Start Server
const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`[SUCCESS] Backend API running on http://localhost:${PORT}`);
  console.log(`[INFO] API Endpoints:`);
  console.log(`  - http://localhost:${PORT}/api/health`);
  console.log(`  - http://localhost:${PORT}/api/products`);
  console.log(`  - http://localhost:${PORT}/api/cart`);
  console.log(`  - http://localhost:${PORT}/api/orders`);
  console.log(`  - http://localhost:${PORT}/api/auth`);
});

module.exports = app;
