const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get dashboard stats
  router.get('/dashboard/stats', async (req, res) => {
    try {
      const orders = await pool.query('SELECT COUNT(*) FROM orders');
      const products = await pool.query('SELECT COUNT(*) FROM products');
      const users = await pool.query('SELECT COUNT(*) FROM users');
      const revenue = await pool.query('SELECT SUM(total_amount) FROM orders WHERE status = \'completed\'');

      res.json({
        totalOrders: parseInt(orders.rows[0].count),
        totalProducts: parseInt(products.rows[0].count),
        totalUsers: parseInt(users.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].sum) || 0
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add product
  router.post('/products', async (req, res) => {
    const { name, description, price, category, stock } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO products (name, description, price, category, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, category, stock]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create offer
  router.post('/offers', async (req, res) => {
    const { product_id, discount_percent, title, start_date, end_date } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO offers (product_id, discount_percent, title, start_date, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [product_id, discount_percent, title, start_date, end_date]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get offers
  router.get('/offers', async (req, res) => {
    try {
      const result = await pool.query('SELECT o.*, p.name as product_name FROM offers o JOIN products p ON o.product_id = p.id');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
