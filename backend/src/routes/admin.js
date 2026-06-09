const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const { v4: uuidv4 } = require('uuid');

const verifyToken = authRoutes.verifyToken;

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Create product
router.post('/products', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { sku, name, description, price, original_price, discount_percentage, category, sub_category, image_urls, video_urls, stock_quantity } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      `INSERT INTO products (sku, name, description, price, original_price, discount_percentage, category, sub_category, image_urls, video_urls, stock_quantity, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [sku, name, description, price, original_price || price, discount_percentage || 0, category, sub_category || '', image_urls || [], video_urls || [], stock_quantity || 0, userId]
    );

    // Invalidate cache
    const redisClient = req.app.locals.redis;
    redisClient.del(`products:${category}:1:20:newest:`);
    redisClient.del('categories');

    // Notify admin subscribers
    const io = req.app.locals.io;
    io.to('admin').emit('product-created', { product: result.rows[0] });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:productId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, original_price, discount_percentage, category, stock_quantity, is_active } = req.body;
    const db = req.app.locals.db;

    const result = await db.query(
      `UPDATE products SET name = $1, description = $2, price = $3, original_price = $4, discount_percentage = $5, category = $6, stock_quantity = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, description, price, original_price || price, discount_percentage || 0, category, stock_quantity || 0, is_active !== false, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Invalidate caches
    const redisClient = req.app.locals.redis;
    redisClient.del(`product:${productId}`);
    redisClient.del(`products:${category}:1:20:newest:`);
    redisClient.del('categories');

    // Notify subscribers
    const io = req.app.locals.io;
    io.to('admin').emit('product-updated', { product: result.rows[0] });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Create sales offer
router.post('/sales-offers', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, discount_percentage, discount_amount, offer_type, applicable_categories, min_purchase_amount, start_date, end_date } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      `INSERT INTO sales_offers (title, description, discount_percentage, discount_amount, offer_type, applicable_categories, min_purchase_amount, start_date, end_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, description, discount_percentage || 0, discount_amount || 0, offer_type || 'percentage', applicable_categories || [], min_purchase_amount || 0, start_date, end_date, userId]
    );

    // Notify admin
    const io = req.app.locals.io;
    io.to('admin').emit('offer-created', { offer: result.rows[0] });
    io.emit('offers-updated'); // Notify all connected clients

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Create offer error:', error);
    res.status(500).json({ error: 'Failed to create offer' });
  }
});

// Get all sales offers
router.get('/sales-offers', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;

    const result = await db.query(
      'SELECT * FROM sales_offers ORDER BY created_at DESC'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[v0] Get offers error:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});

// Update sales offer
router.put('/sales-offers/:offerId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { offerId } = req.params;
    const { title, description, discount_percentage, discount_amount, start_date, end_date, is_active } = req.body;
    const db = req.app.locals.db;

    const result = await db.query(
      `UPDATE sales_offers SET title = $1, description = $2, discount_percentage = $3, discount_amount = $4, start_date = $5, end_date = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, discount_percentage || 0, discount_amount || 0, start_date, end_date, is_active !== false, offerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    // Notify all clients
    const io = req.app.locals.io;
    io.emit('offers-updated', { offer: result.rows[0] });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Update offer error:', error);
    res.status(500).json({ error: 'Failed to update offer' });
  }
});

// Get dashboard stats
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;

    // Total users
    const usersResult = await db.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Total orders
    const ordersResult = await db.query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    // Revenue (paid orders)
    const revenueResult = await db.query('SELECT COALESCE(SUM(final_amount), 0) as total FROM orders WHERE payment_status = $1', ['paid']);
    const totalRevenue = parseFloat(revenueResult.rows[0].total);

    // Products count
    const productsResult = await db.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);

    // Pending returns
    const returnsResult = await db.query('SELECT COUNT(*) FROM returns WHERE status = $1', ['pending']);
    const pendingReturns = parseInt(returnsResult.rows[0].count);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      totalProducts,
      pendingReturns
    });
  } catch (error) {
    console.error('[v0] Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get orders (admin view)
router.get('/orders', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT o.id, o.order_number, o.final_amount, o.status, o.payment_status, o.created_at, u.email FROM orders o JOIN users u ON o.user_id = u.id';
    const params = [];

    if (status) {
      query += ` WHERE o.status = $1`;
      params.push(status);
    }

    const countQuery = status 
      ? `SELECT COUNT(*) FROM orders WHERE status = $1`
      : `SELECT COUNT(*) FROM orders`;

    const countResult = await db.query(countQuery, status ? [status] : []);
    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
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
    console.error('[v0] Get admin orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status
router.put('/orders/:orderId/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;

    const result = await db.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Notify user
    const io = req.app.locals.io;
    io.to(`user-${result.rows[0].user_id}`).emit('order-status-updated', {
      orderId: result.rows[0].id,
      status: result.rows[0].status
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
