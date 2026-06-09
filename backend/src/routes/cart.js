const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');

const verifyToken = authRoutes.verifyToken;

// Get cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.discount_percentage, p.image_urls, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1
       ORDER BY ci.added_at DESC`,
      [userId]
    );

    const cartItems = result.rows;

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.price * (1 - item.discount_percentage / 100);
      return sum + (price * item.quantity);
    }, 0);

    res.json({
      items: cartItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('[v0] Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    if (!productId || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    // Check product exists
    const productResult = await db.query(
      'SELECT stock_quantity FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Upsert cart item
    const result = await db.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
      [userId, productId, quantity]
    );

    res.json({ message: 'Added to cart', cartItem: result.rows[0] });
  } catch (error) {
    console.error('[v0] Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const db = req.app.locals.db;
    const { userId } = req;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const result = await db.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [quantity, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated', cartItem: result.rows[0] });
  } catch (error) {
    console.error('[v0] Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    const { userId } = req;

    const result = await db.query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('[v0] Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { userId } = req;

    await db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('[v0] Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;
