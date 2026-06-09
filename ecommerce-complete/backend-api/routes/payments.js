const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce'
});

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
  key_secret: process.env.RAZORPAY_SECRET_KEY || 'rzp_test_secret'
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

// Create order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { amount, cartItems } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order to database
    const result = await pool.query(
      `INSERT INTO orders (user_id, razorpay_order_id, total_amount, status, items)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING id, razorpay_order_id, total_amount`,
      [req.userId, razorpayOrder.id, amount, JSON.stringify(cartItems)]
    );

    res.json({
      orderId: result.rows[0].id,
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: 'INR',
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET_KEY || 'rzp_test_secret');
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update order status
    const result = await pool.query(
      `UPDATE orders 
       SET status = 'completed', razorpay_payment_id = $1, payment_verified = true
       WHERE user_id = $2 AND razorpay_order_id = $3
       RETURNING id`,
      [razorpayPaymentId, req.userId, razorpayOrderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Clear user's cart
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.userId]);

    res.json({ 
      message: 'Payment verified successfully',
      orderId: result.rows[0].id 
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order status
router.get('/order-status/:orderId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, razorpay_payment_id, status, total_amount FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.orderId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
