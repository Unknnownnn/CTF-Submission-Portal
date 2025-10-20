const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Make user admin
router.post('/make-admin', authenticateToken, requireAdmin, [
  body('email').trim().notEmpty().withMessage('Email is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const connection = await pool.getConnection();

    // Check if user exists
    const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user to admin
    await connection.execute('UPDATE users SET is_admin = TRUE WHERE email = ?', [email]);
    connection.release();

    res.json({ success: true, message: `User ${email} is now an admin` });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
