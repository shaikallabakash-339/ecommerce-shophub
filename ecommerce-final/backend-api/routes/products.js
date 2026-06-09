const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get all products
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM products LIMIT 100');
      res.json({ products: result.rows, count: result.rows.length });
    } catch (error) {
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
      res.status(500).json({ error: error.message });
    }
  });

  // Search products
  router.get('/search/:query', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM products WHERE name ILIKE $1 OR description ILIKE $1',
        [`%${req.params.query}%`]
      );
      res.json({ products: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
