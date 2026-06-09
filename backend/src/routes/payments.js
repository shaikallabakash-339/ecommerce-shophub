const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const authRoutes = require('./auth');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const verifyToken = authRoutes.verifyToken;

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create-order', verifyToken, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, promoCode } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    // Calculate totals
    let subtotal = 0;
    let discountAmount = 0;

    for (const item of items) {
      const productResult = await db.query(
        'SELECT price, discount_percentage FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(400).json({ error: `Product ${item.product_id} not found` });
      }

      const product = productResult.rows[0];
      const itemDiscount = (product.price * product.discount_percentage / 100) * item.quantity;
      const itemPrice = product.price * item.quantity;

      subtotal += itemPrice;
      discountAmount += itemDiscount;
    }

    // Apply promo code if provided
    if (promoCode) {
      const offerResult = await db.query(
        'SELECT discount_percentage, discount_amount FROM sales_offers WHERE title = $1 AND is_active = true AND NOW() BETWEEN start_date AND end_date',
        [promoCode]
      );

      if (offerResult.rows.length > 0) {
        const offer = offerResult.rows[0];
        if (offer.discount_percentage) {
          discountAmount += (subtotal * offer.discount_percentage / 100);
        } else if (offer.discount_amount) {
          discountAmount += offer.discount_amount;
        }
      }
    }

    const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST
    const finalAmount = subtotal - discountAmount + taxAmount;

    // Create order in Razorpay
    const orderNumber = `ORD-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderNumber,
      notes: {
        userId: userId,
        orderNumber: orderNumber
      }
    });

    // Save order to database
    const orderResult = await db.query(
      `INSERT INTO orders (order_number, user_id, total_amount, discount_amount, tax_amount, final_amount, razorpay_order_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [orderNumber, userId, subtotal, discountAmount, taxAmount, finalAmount, razorpayOrder.id]
    );

    const orderId = orderResult.rows[0].id;

    // Save order items
    for (const item of items) {
      const productResult = await db.query(
        'SELECT price, discount_percentage FROM products WHERE id = $1',
        [item.product_id]
      );

      const product = productResult.rows[0];
      const itemDiscount = product.price * product.discount_percentage / 100;

      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, discount_amount) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.product_id, item.quantity, product.price, itemDiscount * item.quantity]
      );
    }

    res.json({
      orderId: orderId,
      orderNumber: orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: finalAmount,
      currency: 'INR'
    });
  } catch (error) {
    console.error('[v0] Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment
router.post('/verify-payment', verifyToken, async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);

    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      return res.status(400).json({ error: 'Payment not successful' });
    }

    // Update order
    const orderResult = await db.query(
      'UPDATE orders SET payment_status = $1, razorpay_payment_id = $2, status = $3, updated_at = CURRENT_TIMESTAMP WHERE razorpay_order_id = $4 AND user_id = $5 RETURNING id, order_number',
      ['paid', razorpayPaymentId, 'confirmed', razorpayOrderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Clear cart
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    // Emit real-time notification
    const io = req.app.locals.io;
    io.to(`user-${userId}`).emit('order-confirmed', {
      orderId: order.id,
      orderNumber: order.order_number,
      timestamp: new Date()
    });

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
      [userId, 'order_paid', 'order', order.id]
    );

    res.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: 'Payment successful'
    });
  } catch (error) {
    console.error('[v0] Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Get payment status
router.get('/status/:razorpayOrderId', verifyToken, async (req, res) => {
  try {
    const { razorpayOrderId } = req.params;

    const order = await razorpay.orders.fetch(razorpayOrderId);

    res.json({
      orderId: order.id,
      status: order.status,
      amount: order.amount / 100,
      currency: order.currency
    });
  } catch (error) {
    console.error('[v0] Get payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

module.exports = router;
