// routes/users.js
'use strict';
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/users
router.get('/', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    const r = await db.execute(
      `SELECT USER_ID, USERNAME, EMAIL, FULL_NAME, ROLE, IS_ACTIVE, CREATED_AT, LAST_LOGIN FROM INV_USERS ORDER BY CREATED_AT DESC`
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/users
router.post('/', auth, requireRole('ADMIN'), async (req, res) => {
  const { username, email, fullName, password, role } = req.body;
  if (!username || !email || !fullName || !password) return res.status(400).json({ error: 'All fields required' });
  try {
    const hash = bcrypt.hashSync(password, 10);
    const userId = uuidv4();
    await db.execute(
      `INSERT INTO INV_USERS (USER_ID,USERNAME,EMAIL,FULL_NAME,PASSWORD_HASH,ROLE) VALUES (:userId,:username,:email,:fullName,:hash,:role)`,
      { userId, username, email, fullName, hash, role: role || 'USER' }
    );
    res.status(201).json({ userId, message: 'User created' });
  } catch (e) {
    if (e.message.includes('ORA-00001')) return res.status(409).json({ error: 'Username or email already exists' });
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/users/:id
router.put('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  const { fullName, role, isActive, password } = req.body;
  try {
    let extraClause = '';
    const binds = { fullName: fullName || null, role: role || null, isActive: isActive !== undefined ? (isActive ? 1 : 0) : null, id: req.params.id };
    if (password) { extraClause = ', PASSWORD_HASH = :hash'; binds.hash = bcrypt.hashSync(password, 10); }
    await db.execute(
      `UPDATE INV_USERS SET FULL_NAME = NVL(:fullName, FULL_NAME), ROLE = NVL(:role, ROLE), IS_ACTIVE = NVL(:isActive, IS_ACTIVE) ${extraClause} WHERE USER_ID = :id`, binds
    );
    res.json({ message: 'User updated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/users/search?q=
router.get('/search', auth, async (req, res) => {
  const q = (req.query.q || '').toUpperCase();
  try {
    const r = await db.execute(
      `SELECT USER_ID, USERNAME, FULL_NAME, EMAIL FROM INV_USERS WHERE IS_ACTIVE = 1 AND (UPPER(FULL_NAME) LIKE :q OR UPPER(USERNAME) LIKE :q) FETCH FIRST 10 ROWS ONLY`,
      { q: `%${q}%` }
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
