const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

module.exports = (pool) => {
  // Register
  router.post('/register', async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email',
        [email, hashedPassword, first_name, last_name]
      );
      res.json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Login
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'User not found' });
      }
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
      res.json({ message: 'Login successful', token, user: { id: user.id, email: user.email, is_admin: user.is_admin } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Profile
  router.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      const result = await pool.query('SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = $1', [decoded.userId]);
      res.json(result.rows[0]);
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  return router;
};
