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

// Get user's orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, total_amount, status, created_at, razorpay_payment_id 
       FROM orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, total_amount, status, items, created_at, razorpay_payment_id 
       FROM orders 
       WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track order
router.get('/:orderId/track', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, status, created_at, updated_at FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];
    const statusTimeline = [
      { status: 'Pending', completed: order.status !== 'pending' },
      { status: 'Processing', completed: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' },
      { status: 'Shipped', completed: order.status === 'shipped' || order.status === 'delivered' },
      { status: 'Delivered', completed: order.status === 'delivered' }
    ];

    res.json({ order, statusTimeline });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel order
router.put('/:orderId/cancel', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE orders 
       SET status = 'cancelled' 
       WHERE id = $1 AND user_id = $2 AND status = 'pending'
       RETURNING id, status`,
      [req.params.orderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    res.json({ message: 'Order cancelled', order: result.rows[0] });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Return order
router.post('/:orderId/return', verifyToken, async (req, res) => {
  try {
    const { reason } = req.body;

    const result = await pool.query(
      `INSERT INTO returns (order_id, reason, status) 
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [req.params.orderId, reason]
    );

    res.json({ message: 'Return initiated', returnId: result.rows[0].id });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate invoice
router.get('/:orderId/invoice', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, total_amount, status, created_at, items FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.orderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = result.rows[0];
    const invoice = {
      invoiceNumber: `INV-${order.id}-${Date.now()}`,
      orderDate: order.created_at,
      totalAmount: order.total_amount,
      items: order.items
    };

    res.json(invoice);
  } catch (error) {
    console.error('Generate invoice error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
