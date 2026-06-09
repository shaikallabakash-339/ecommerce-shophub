const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { v4: uuidv4 } = require('uuid');

const verifyToken = authRoutes.verifyToken;

// Get user orders
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, order_number, total_amount, discount_amount, final_amount, status, payment_status, created_at FROM orders WHERE user_id = $1';
    const params = [userId];

    if (status) {
      query += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    // Count total
    const countResult = await db.query(
      `SELECT COUNT(*) FROM orders WHERE user_id = $1 ${status ? `AND status = $2` : ''}`,
      status ? [userId, status] : [userId]
    );

    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      orders: result.rows,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('[v0] Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = req.app.locals.db;
    const { userId } = req;

    // Get order
    const orderResult = await db.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await db.query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.discount_amount, p.name, p.image_urls
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    // Get invoice if exists
    const invoiceResult = await db.query(
      'SELECT id, invoice_number, pdf_url, generated_at FROM invoices WHERE order_id = $1',
      [orderId]
    );

    // Get returns if any
    const returnsResult = await db.query(
      'SELECT id, return_number, reason, status, refund_amount, created_at FROM returns WHERE order_id = $1',
      [orderId]
    );

    res.json({
      order: order,
      items: itemsResult.rows,
      invoice: invoiceResult.rows[0] || null,
      returns: returnsResult.rows
    });
  } catch (error) {
    console.error('[v0] Get order details error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Create return request
router.post('/:orderId/return', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, items } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    // Verify order belongs to user
    const orderResult = await db.query(
      'SELECT id, final_amount FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];
    const returnNumber = `RET-${Date.now()}-${uuidv4().slice(0, 8)}`;

    // Create return request
    const returnResult = await db.query(
      'INSERT INTO returns (order_id, return_number, reason) VALUES ($1, $2, $3) RETURNING id, return_number',
      [orderId, returnNumber, reason]
    );

    // Emit notification to admin
    const io = req.app.locals.io;
    io.to('admin').emit('return-request', {
      returnId: returnResult.rows[0].id,
      returnNumber: returnNumber,
      orderId: orderId,
      reason: reason,
      timestamp: new Date()
    });

    res.status(201).json({
      returnId: returnResult.rows[0].id,
      returnNumber: returnNumber,
      message: 'Return request created'
    });
  } catch (error) {
    console.error('[v0] Create return error:', error);
    res.status(500).json({ error: 'Failed to create return request' });
  }
});

// Track order
router.get('/:orderId/track', async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = req.app.locals.db;

    const result = await db.query(
      'SELECT id, order_number, status, payment_status, created_at, updated_at FROM orders WHERE id = $1',
      [orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

module.exports = router;
