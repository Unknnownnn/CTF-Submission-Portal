const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

const validateEmail = (email) => {
  const regex = /^[A-Za-z0-9._%+-]+@vitstudent\.ac\.in$/;
  return regex.test(email);
};

// Register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email must end with @vitstudent.ac.in' });
  }

  try {
    const connection = await pool.getConnection();

    // Check if user already exists
    const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    await connection.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    // Get inserted user
    const [newUser] = await connection.execute('SELECT id, email, name, is_admin FROM users WHERE email = ?', [email]);
    connection.release();

    const user = newUser[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'your_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('email').trim().notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT id, email, name, password_hash, is_admin FROM users WHERE email = ?', [email]);
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      process.env.JWT_SECRET || 'your_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name, is_admin: user.is_admin } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret');
    res.json({ user: decoded });
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
});

module.exports = router;
