const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const redis = require('redis');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce'
});

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Get all products with caching
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    
    // Try to get from cache
    const cacheKey = `products:${category || 'all'}:${search || 'all'}:${page}`;
    
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
    } catch (cacheErr) {
      console.log('Cache read error:', cacheErr);
    }

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    if (search) {
      query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }

    query += ' LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const response = {
      products: result.rows,
      page: parseInt(page),
      limit: parseInt(limit),
      total: result.rows.length
    };

    // Cache for 5 minutes
    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(response));
    } catch (cacheErr) {
      console.log('Cache write error:', cacheErr);
    }

    res.json(response);
  } catch (error) {
    console.error('Products error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categories
router.get('/categories/list', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
