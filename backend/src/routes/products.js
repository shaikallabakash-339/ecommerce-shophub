const express = require('express');
const router = express.Router();
const redis = require('redis');

const CACHE_TTL = 3600; // 1 hour

// Get products with caching
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 20, sort = 'newest', search } = req.query;
    const db = req.app.locals.db;
    const redisClient = req.app.locals.redis;
    const offset = (page - 1) * limit;

    // Create cache key
    const cacheKey = `products:${category || 'all'}:${page}:${limit}:${sort}:${search || ''}`;

    // Check cache first
    redisClient.get(cacheKey, async (err, cachedData) => {
      if (cachedData && !err) {
        console.log('[v0] Cache hit for products');
        return res.json(JSON.parse(cachedData));
      }

      try {
        let query = 'SELECT id, sku, name, description, price, original_price, discount_percentage, category, image_urls, stock_quantity, rating, review_count, created_at FROM products WHERE is_active = true';
        const params = [];

        if (category && category !== 'all') {
          query += ' AND category = $' + (params.length + 1);
          params.push(category);
        }

        if (search) {
          query += ' AND (name ILIKE $' + (params.length + 1) + ' OR description ILIKE $' + (params.length + 2) + ')';
          params.push(`%${search}%`, `%${search}%`);
        }

        // Sorting
        if (sort === 'price-low') query += ' ORDER BY price ASC';
        else if (sort === 'price-high') query += ' ORDER BY price DESC';
        else if (sort === 'rating') query += ' ORDER BY rating DESC';
        else query += ' ORDER BY created_at DESC'; // newest

        // Total count query
        let countQuery = 'SELECT COUNT(*) FROM products WHERE is_active = true';
        if (category && category !== 'all') {
          countQuery += ` AND category = '${category}'`;
        }
        if (search) {
          countQuery += ` AND (name ILIKE '%${search}%' OR description ILIKE '%${search}%')`;
        }

        const countResult = await db.query(countQuery);
        const totalCount = parseInt(countResult.rows[0].count);

        // Add pagination
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        const response = {
          products: result.rows,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(totalCount / limit)
          }
        };

        // Cache the result
        redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(response), (err) => {
          if (err) console.error('[v0] Cache error:', err);
        });

        res.json(response);
      } catch (error) {
        console.error('[v0] Product query error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
      }
    });
  } catch (error) {
    console.error('[v0] Products route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    const redisClient = req.app.locals.redis;
    const cacheKey = `product:${id}`;

    redisClient.get(cacheKey, async (err, cachedData) => {
      if (cachedData && !err) {
        return res.json(JSON.parse(cachedData));
      }

      const result = await db.query(
        'SELECT * FROM products WHERE id = $1 AND is_active = true',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Get reviews
      const reviewsResult = await db.query(
        'SELECT r.id, r.rating, r.title, r.comment, r.created_at, u.first_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 10',
        [id]
      );

      const product = result.rows[0];
      product.reviews = reviewsResult.rows;

      redisClient.setex(cacheKey, CACHE_TTL, JSON.stringify(product), (err) => {
        if (err) console.error('[v0] Cache error:', err);
      });

      res.json(product);
    });
  } catch (error) {
    console.error('[v0] Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get categories (cached)
router.get('/categories/list', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const redisClient = req.app.locals.redis;
    const cacheKey = 'categories';

    redisClient.get(cacheKey, async (err, cachedData) => {
      if (cachedData && !err) {
        return res.json(JSON.parse(cachedData));
      }

      const result = await db.query(
        'SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category'
      );

      const categories = result.rows.map(row => row.category);

      redisClient.setex(cacheKey, CACHE_TTL * 2, JSON.stringify(categories), (err) => {
        if (err) console.error('[v0] Cache error:', err);
      });

      res.json(categories);
    });
  } catch (error) {
    console.error('[v0] Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
