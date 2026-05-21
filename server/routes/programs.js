// routes/programs.js
'use strict';
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/programs
router.get('/', auth, async (req, res) => {
  try {
    const r = await db.execute(`SELECT * FROM INV_PROGRAMS WHERE IS_ACTIVE = 1 ORDER BY NAME`);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/programs
router.post('/', auth, requireRole('ADMIN'), async (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Code and Name required' });
  try {
    const programId = uuidv4();
    await db.execute(
      `INSERT INTO INV_PROGRAMS (PROGRAM_ID, CODE, NAME, DESCRIPTION) VALUES (:programId, :code, :name, :description)`,
      { programId, code, name, description: description || null }
    );
    res.status(201).json({ programId, message: 'Program created' });
  } catch (e) {
    if (e.message.includes('ORA-00001')) return res.status(409).json({ error: 'Program code already exists' });
    res.status(500).json({ error: e.message });
  }
});

// GET /api/programs/:id/projects
router.get('/:id/projects', auth, async (req, res) => {
  try {
    const r = await db.execute(
      `SELECT * FROM INV_PROJECTS WHERE PROGRAM_ID = :id AND IS_ACTIVE = 1 ORDER BY NAME`,
      { id: req.params.id }
    );
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/programs/:id/projects
router.post('/:id/projects', auth, requireRole('ADMIN'), async (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'Code and Name required' });
  try {
    const projectId = uuidv4();
    await db.execute(
      `INSERT INTO INV_PROJECTS (PROJECT_ID, PROGRAM_ID, CODE, NAME, DESCRIPTION) VALUES (:projectId, :programId, :code, :name, :description)`,
      { projectId, programId: req.params.id, code, name, description: description || null }
    );
    res.status(201).json({ projectId, message: 'Project created' });
  } catch (e) {
    if (e.message.includes('ORA-00001')) return res.status(409).json({ error: 'Project code already exists' });
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
