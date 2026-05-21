// routes/assignments.js
'use strict';
const router = require('express').Router();
const db = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/assignments — assign a device
router.post('/', auth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const { deviceId, assignmentType, assignedToName, assignedToUser, programId, projectId, expectedReturn, notes } = req.body;
  if (!deviceId || !assignmentType) return res.status(400).json({ error: 'deviceId and assignmentType required' });

  try {
    // Check device is available
    const dev = await db.execute(`SELECT STATUS FROM INV_DEVICES WHERE DEVICE_ID = :id`, { id: deviceId });
    if (!dev.rows.length) return res.status(404).json({ error: 'Device not found' });
    if (dev.rows[0].STATUS !== 'AVAILABLE') {
      return res.status(409).json({ error: `Device is currently ${dev.rows[0].STATUS}, not available for assignment` });
    }

    // Close any old active assignments (safety net)
    await db.execute(
      `UPDATE INV_ASSIGNMENTS SET IS_ACTIVE = 0, RETURN_DATE = CURRENT_TIMESTAMP WHERE DEVICE_ID = :id AND IS_ACTIVE = 1`,
      { id: deviceId }
    );

    await db.execute(
      `INSERT INTO INV_ASSIGNMENTS (DEVICE_ID, ASSIGNMENT_TYPE, ASSIGNED_TO_NAME, ASSIGNED_TO_USER,
         PROGRAM_ID, PROJECT_ID, ASSIGNED_BY, EXPECTED_RETURN, NOTES)
       VALUES (:deviceId, :assignmentType, :assignedToName, :assignedToUser,
         :programId, :projectId, :assignedBy, TO_DATE(:expectedReturn, 'YYYY-MM-DD'), :notes)`,
      {
        deviceId, assignmentType,
        assignedToName: assignedToName || null,
        assignedToUser: assignedToUser || null,
        programId: programId || null,
        projectId: projectId || null,
        assignedBy: req.user.userId,
        expectedReturn: expectedReturn || null,
        notes: notes || null
      }
    );

    await db.execute(
      `UPDATE INV_DEVICES SET STATUS = 'ASSIGNED', UPDATED_AT = CURRENT_TIMESTAMP WHERE DEVICE_ID = :id`,
      { id: deviceId }
    );

    await db.execute(
      `INSERT INTO INV_AUDIT (DEVICE_ID, ACTION, NEW_VALUE, CHANGED_BY)
       VALUES (:deviceId, 'ASSIGNED', :val, :by)`,
      { deviceId, val: `Type:${assignmentType} To:${assignedToName || assignedToUser}`, by: req.user.username }
    );

    res.status(201).json({ message: 'Device assigned successfully' });
  } catch (e) {
    console.error('POST /assignments error:', e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/assignments/:id/return — return a device
router.put('/:id/return', auth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const { notes } = req.body;
  try {
    const result = await db.execute(
      `SELECT a.DEVICE_ID FROM INV_ASSIGNMENTS a WHERE a.ASSIGNMENT_ID = :id AND a.IS_ACTIVE = 1`,
      { id: req.params.id }
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Active assignment not found' });

    const deviceId = result.rows[0].DEVICE_ID;

    await db.execute(
      `UPDATE INV_ASSIGNMENTS SET IS_ACTIVE = 0, RETURN_DATE = CURRENT_TIMESTAMP,
         NOTES = NVL(:notes, NOTES) WHERE ASSIGNMENT_ID = :id`,
      { notes: notes || null, id: req.params.id }
    );

    await db.execute(
      `UPDATE INV_DEVICES SET STATUS = 'AVAILABLE', UPDATED_AT = CURRENT_TIMESTAMP WHERE DEVICE_ID = :id`,
      { id: deviceId }
    );

    await db.execute(
      `INSERT INTO INV_AUDIT (DEVICE_ID, ACTION, NEW_VALUE, CHANGED_BY)
       VALUES (:deviceId, 'RETURNED', 'Device returned to inventory', :by)`,
      { deviceId, by: req.user.username }
    );

    res.json({ message: 'Device returned successfully' });
  } catch (e) {
    console.error('PUT /assignments/:id/return error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/assignments — list all active assignments
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT a.*, d.MAKE, d.MODEL, d.IMEI, d.COLOR,
              u.FULL_NAME AS ASSIGNED_TO_FULLNAME,
              p.NAME AS PROGRAM_NAME, pr.NAME AS PROJECT_NAME,
              ab.FULL_NAME AS ASSIGNED_BY_NAME
       FROM INV_ASSIGNMENTS a
       JOIN INV_DEVICES d ON d.DEVICE_ID = a.DEVICE_ID
       LEFT JOIN INV_USERS u ON u.USER_ID = a.ASSIGNED_TO_USER
       LEFT JOIN INV_PROGRAMS p ON p.PROGRAM_ID = a.PROGRAM_ID
       LEFT JOIN INV_PROJECTS pr ON pr.PROJECT_ID = a.PROJECT_ID
       LEFT JOIN INV_USERS ab ON ab.USER_ID = a.ASSIGNED_BY
       WHERE a.IS_ACTIVE = 1
       ORDER BY a.ASSIGNED_DATE DESC`
    );
    res.json({ data: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
