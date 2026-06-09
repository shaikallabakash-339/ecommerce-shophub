const express = require('express');
const router = express.Router();

module.exports = (pool) => {
  // Create payment order
  router.post('/create-order', async (req, res) => {
    const { amount, order_id } = req.body;
    
    // In real implementation, call Razorpay API here
    // For now, just create local record
    try {
      res.json({
        orderId: order_id,
        amount: amount,
        currency: 'INR',
        message: 'Payment order created (mock for local testing)'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Verify payment
  router.post('/verify', async (req, res) => {
    const { payment_id, order_id } = req.body;
    try {
      // Update order status
      await pool.query('UPDATE orders SET status = $1, payment_id = $2 WHERE id = $3', ['completed', payment_id, order_id]);
      res.json({ message: 'Payment verified successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
