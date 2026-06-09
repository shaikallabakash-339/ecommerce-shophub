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

// Get all products with advanced filtering and caching
router.get('/', async (req, res) => {
  try {
    const {
      gender, productType, ageGroup, sizeFilter, priceMin, priceMax,
      onSale, search, category, page = 1, limit = 12
    } = req.query;
    const offset = (page - 1) * limit;
    
    // Try to get from cache (cache key with filters)
    const cacheKey = `products:${gender || 'all'}:${productType || 'all'}:${ageGroup || 'all'}:${search || 'all'}:${page}`;
    
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

    if (gender) {
      query += ' AND gender = $' + (params.length + 1);
      params.push(gender);
    }

    if (productType) {
      query += ' AND product_type = $' + (params.length + 1);
      params.push(productType);
    }

    if (ageGroup) {
      query += ' AND age_group = $' + (params.length + 1);
      params.push(ageGroup);
    }

    if (sizeFilter) {
      query += ' AND sizes @> $' + (params.length + 1);
      params.push(JSON.stringify([sizeFilter]));
    }

    if (priceMin) {
      query += ' AND price >= $' + (params.length + 1);
      params.push(parseFloat(priceMin));
    }

    if (priceMax) {
      query += ' AND price <= $' + (params.length + 1);
      params.push(parseFloat(priceMax));
    }

    if (onSale === 'true') {
      query += ' AND is_on_sale = true';
    }

    if (search) {
      query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 2) + ')';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
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

// Get filter options
router.get('/filters/options', async (req, res) => {
  try {
    const genders = await pool.query('SELECT DISTINCT gender FROM products WHERE gender IS NOT NULL ORDER BY gender');
    const types = await pool.query('SELECT DISTINCT product_type FROM products WHERE product_type IS NOT NULL ORDER BY product_type');
    const ages = await pool.query('SELECT DISTINCT age_group FROM products WHERE age_group IS NOT NULL ORDER BY age_group');
    const prices = await pool.query('SELECT MIN(price) as min_price, MAX(price) as max_price FROM products');

    // Get all unique sizes
    const sizeResult = await pool.query('SELECT DISTINCT jsonb_array_elements(sizes) as size FROM products WHERE sizes IS NOT NULL');
    const sizes = [...new Set(sizeResult.rows.map(r => r.size))];

    res.json({
      genders: genders.rows.map(r => r.gender),
      productTypes: types.rows.map(r => r.product_type),
      ageGroups: ages.rows.map(r => r.age_group),
      sizes: sizes.sort(),
      priceRange: {
        min: parseFloat(prices.rows[0].min_price),
        max: parseFloat(prices.rows[0].max_price)
      }
    });
  } catch (error) {
    console.error('Filter options error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
