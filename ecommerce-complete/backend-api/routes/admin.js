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

const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    
    if (!req.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Add product
router.post('/products', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, description, price, category, image_url, stock, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, price, category, imageUrl, stock || 0, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update product
router.put('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category = COALESCE($4, category),
           image_url = COALESCE($5, image_url),
           stock = COALESCE($6, stock),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, price, category, imageUrl, stock, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete product
router.delete('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add sales offer
router.post('/offers', verifyAdminToken, async (req, res) => {
  try {
    const { productId, discountPercent, startDate, endDate, title } = req.body;

    const result = await pool.query(
      `INSERT INTO sales_offers (product_id, discount_percent, start_date, end_date, title, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [productId, discountPercent, startDate, endDate, title, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all offers
router.get('/offers', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT so.*, p.name as product_name 
       FROM sales_offers so
       JOIN products p ON so.product_id = p.id
       ORDER BY so.created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update offer
router.put('/offers/:id', verifyAdminToken, async (req, res) => {
  try {
    const { discountPercent, startDate, endDate, title } = req.body;

    const result = await pool.query(
      `UPDATE sales_offers 
       SET discount_percent = COALESCE($1, discount_percent),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date),
           title = COALESCE($4, title)
       WHERE id = $5
       RETURNING *`,
      [discountPercent, startDate, endDate, title, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete offer
router.delete('/offers/:id', verifyAdminToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sales_offers WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.json({ message: 'Offer deleted' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', verifyAdminToken, async (req, res) => {
  try {
    const totalOrders = await pool.query('SELECT COUNT(*) as count FROM orders');
    const totalRevenue = await pool.query('SELECT SUM(total_amount) as total FROM orders WHERE status = \'completed\'');
    const totalProducts = await pool.query('SELECT COUNT(*) as count FROM products');
    const totalUsers = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_admin = false');

    res.json({
      totalOrders: totalOrders.rows[0].count,
      totalRevenue: totalRevenue.rows[0].total || 0,
      totalProducts: totalProducts.rows[0].count,
      totalUsers: totalUsers.rows[0].count
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
