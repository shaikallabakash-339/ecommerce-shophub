const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce'
});

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

// Get cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.name, p.price, p.image_url 
      FROM cart c 
      JOIN products p ON c.product_id = p.id 
      WHERE c.user_id = $1
    `, [req.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity required' });
    }

    // Check if already in cart
    const existing = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.userId, productId]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        'UPDATE cart SET quantity = quantity + $1 WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [quantity, req.userId, productId]
      );
      return res.json(result.rows[0]);
    }

    const result = await pool.query(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, productId, quantity]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
router.put('/:cartId', verifyToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    if (quantity === 0) {
      await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [req.params.cartId, req.userId]);
      return res.json({ message: 'Item removed' });
    }

    const result = await pool.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, req.params.cartId, req.userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/:cartId', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE id = $1 AND user_id = $2', [req.params.cartId, req.userId]);
    res.json({ message: 'Item removed' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.userId]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
