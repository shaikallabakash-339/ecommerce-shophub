const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce'
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add search to history
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query required' });
    }

    await pool.query(
      'INSERT INTO search_history (user_id, search_query) VALUES ($1, $2)',
      [req.userId, query.trim()]
    );

    res.json({ message: 'Search added to history' });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get search history for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT search_query FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
      [req.userId]
    );

    res.json({
      history: result.rows.map(r => r.search_query)
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear search history
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM search_history WHERE user_id = $1',
      [req.userId]
    );

    res.json({ message: 'Search history cleared' });
  } catch (error) {
    console.error('Clear search history error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
