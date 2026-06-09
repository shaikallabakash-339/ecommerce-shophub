const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get user orders
  router.get('/user/:userId', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
      res.json({ orders: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create order
  router.post('/', async (req, res) => {
    const { user_id, total_amount, items } = req.body;
    try {
      const orderResult = await pool.query(
        'INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING *',
        [user_id, total_amount, 'pending']
      );
      const orderId = orderResult.rows[0].id;
      
      for (const item of items) {
        await pool.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [orderId, item.product_id, item.quantity, item.price]
        );
      }
      res.json(orderResult.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get order details
  router.get('/:id', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
      const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);
      res.json({ ...result.rows[0], items: itemsResult.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
