const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const bcrypt = require('bcryptjs');

const verifyToken = authRoutes.verifyToken;

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'SELECT id, email, first_name, last_name, phone, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { first_name, last_name, phone } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, email, first_name, last_name, phone',
      [first_name, last_name || '', phone || '', userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get addresses
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'SELECT id, address_type, full_name, phone, street, city, state, postal_code, country, is_default FROM addresses WHERE user_id = $1 ORDER BY is_default DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[v0] Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add address
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const { address_type, full_name, phone, street, city, state, postal_code, is_default } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    if (is_default) {
      await db.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }

    const result = await db.query(
      `INSERT INTO addresses (user_id, address_type, full_name, phone, street, city, state, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, address_type, full_name, phone, street, city, state, postal_code, is_default || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Add address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
router.put('/addresses/:addressId', verifyToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const { address_type, full_name, phone, street, city, state, postal_code, is_default } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    if (is_default) {
      await db.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }

    const result = await db.query(
      `UPDATE addresses SET address_type = $1, full_name = $2, phone = $3, street = $4, city = $5, state = $6, postal_code = $7, is_default = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [address_type, full_name, phone, street, city, state, postal_code, is_default || false, addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[v0] Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:addressId', verifyToken, async (req, res) => {
  try {
    const { addressId } = req.params;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted' });
  } catch (error) {
    console.error('[v0] Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Get wishlist
router.get('/wishlist', verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      `SELECT w.id, p.id as product_id, p.name, p.price, p.discount_percentage, p.image_urls, p.stock_quantity
       FROM wishlist_items w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.added_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[v0] Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/wishlist', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'INSERT INTO wishlist_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, productId]
    );

    res.status(201).json({ message: 'Added to wishlist', item: result.rows[0] });
  } catch (error) {
    console.error('[v0] Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/wishlist/:wishlistId', verifyToken, async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2',
      [wishlistId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('[v0] Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Change password
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    // Get user
    const userResult = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('[v0] Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;
