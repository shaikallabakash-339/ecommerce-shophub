const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;
    const db = req.app.locals.db;

    // Validate input
    if (!email || !password || !first_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name',
      [email, password_hash, first_name, last_name || '', phone || '']
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type) VALUES ($1, $2, $3)',
      [user.id, 'user_registered', 'user']
    );

    res.status(201).json({
      user: { id: user.id, email: user.email, first_name: user.first_name },
      token
    });
  } catch (error) {
    console.error('[v0] Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const userResult = await db.query(
      'SELECT id, email, password_hash, first_name, is_admin FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: user.id, email: user.email, first_name: user.first_name, isAdmin: user.is_admin },
      token
    });
  } catch (error) {
    console.error('[v0] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.email = decoded.email;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify token route
router.get('/verify', verifyToken, (req, res) => {
  res.json({ valid: true, userId: req.userId, email: req.email });
});

// Export middleware
router.verifyToken = verifyToken;

module.exports = router;
