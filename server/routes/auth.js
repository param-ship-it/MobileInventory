// routes/auth.js
'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/pool');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const result = await db.execute(
      `SELECT USER_ID, USERNAME, EMAIL, FULL_NAME, ROLE, PASSWORD_HASH, IS_ACTIVE
       FROM INV_USERS WHERE USERNAME = :username OR EMAIL = :username`,
      { username }
    );
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    if (!user.IS_ACTIVE) return res.status(403).json({ error: 'Account is disabled' });
    if (!bcrypt.compareSync(password, user.PASSWORD_HASH)) return res.status(401).json({ error: 'Invalid credentials' });

    // Update last login
    await db.execute(`UPDATE INV_USERS SET LAST_LOGIN = CURRENT_TIMESTAMP WHERE USER_ID = :id`, { id: user.USER_ID });

    const token = jwt.sign(
      { userId: user.USER_ID, username: user.USERNAME, role: user.ROLE, fullName: user.FULL_NAME },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: { userId: user.USER_ID, username: user.USERNAME, email: user.EMAIL, fullName: user.FULL_NAME, role: user.ROLE }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/me — validate token
router.get('/me', require('../middleware/auth').auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
