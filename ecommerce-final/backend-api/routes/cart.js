const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Get cart
  router.get('/:userId', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT c.*, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1',
        [req.params.userId]
      );
      res.json({ items: result.rows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add to cart
  router.post('/', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [user_id, product_id, quantity]
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove from cart
  router.delete('/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM cart WHERE id = $1', [req.params.id]);
      res.json({ message: 'Item removed from cart' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
