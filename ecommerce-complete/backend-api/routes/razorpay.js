const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ecommerce'
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'your-key-id',
  key_secret: process.env.RAZORPAY_SECRET_KEY || 'your-secret-key'
});

// Middleware to verify user token
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

// Create order on Razorpay
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { amount, orderDetails } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      receipt: `order-${Date.now()}`,
      notes: {
        userId,
        orderDetails: JSON.stringify(orderDetails)
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save order to database
    const result = await pool.query(
      `INSERT INTO orders (user_id, total_amount, payment_method, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, amount, status`,
      [userId, amount, 'razorpay', 'pending']
    );

    res.json({
      message: 'Order created successfully',
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: result.rows[0].id
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({ error: 'Order creation failed', details: error.message });
  }
});

// Verify payment
router.post('/verify', verifyToken, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.userId;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY || 'your-secret-key')
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status !== 'captured') {
      return res.status(400).json({ error: 'Payment not captured' });
    }

    // Update order status in database
    const result = await pool.query(
      `UPDATE orders
       SET status = $1, payment_method = $2, updated_at = NOW()
       WHERE user_id = $3 AND id IN (
         SELECT id FROM orders WHERE user_id = $3 ORDER BY created_at DESC LIMIT 1
       )
       RETURNING id, status, total_amount`,
      ['completed', 'razorpay', userId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Order not found' });
    }

    res.json({
      message: 'Payment verified successfully',
      order: result.rows[0],
      paymentId: razorpayPaymentId
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ error: 'Payment verification failed', details: error.message });
  }
});

// Get payment status
router.get('/:orderId/status', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, status, total_amount, payment_method, created_at
       FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

module.exports = router;
