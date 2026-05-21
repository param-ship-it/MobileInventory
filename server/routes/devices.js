// routes/devices.js
'use strict';
const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/pool');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/devices — list with filters, pagination
router.get('/', auth, async (req, res) => {
  const { search, status, make, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = [];
  let binds = {};

  if (search) {
    where.push(`(UPPER(IMEI) LIKE :search OR UPPER(SERIAL_NUMBER) LIKE :search OR UPPER(MAKE) LIKE :search OR UPPER(MODEL) LIKE :search)`);
    binds.search = `%${search.toUpperCase()}%`;
  }
  if (status) { where.push(`STATUS = :status`); binds.status = status.toUpperCase(); }
  if (make)   { where.push(`UPPER(MAKE) = :make`); binds.make = make.toUpperCase(); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const countResult = await db.execute(
      `SELECT COUNT(*) AS TOTAL FROM INV_DEVICES ${whereClause}`, binds
    );
    const total = countResult.rows[0].TOTAL;

    const result = await db.execute(
      `SELECT * FROM (
         SELECT d.*, ROWNUM RN FROM (
           SELECT * FROM INV_DEVICES ${whereClause} ORDER BY CREATED_AT DESC
         ) d WHERE ROWNUM <= :maxRow
       ) WHERE RN > :minRow`,
      { ...binds, maxRow: Number(offset) + Number(limit), minRow: Number(offset) }
    );

    res.json({ total, page: Number(page), limit: Number(limit), data: result.rows });
  } catch (e) {
    console.error('GET /devices error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/devices/:id — device detail + current assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const dev = await db.execute(`SELECT * FROM INV_DEVICES WHERE DEVICE_ID = :id`, { id: req.params.id });
    if (!dev.rows.length) return res.status(404).json({ error: 'Device not found' });

    const assign = await db.execute(
      `SELECT a.*, u.FULL_NAME AS ASSIGNED_TO_FULLNAME, p.NAME AS PROGRAM_NAME, pr.NAME AS PROJECT_NAME,
              ab.FULL_NAME AS ASSIGNED_BY_NAME
       FROM INV_ASSIGNMENTS a
       LEFT JOIN INV_USERS u ON u.USER_ID = a.ASSIGNED_TO_USER
       LEFT JOIN INV_PROGRAMS p ON p.PROGRAM_ID = a.PROGRAM_ID
       LEFT JOIN INV_PROJECTS pr ON pr.PROJECT_ID = a.PROJECT_ID
       LEFT JOIN INV_USERS ab ON ab.USER_ID = a.ASSIGNED_BY
       WHERE a.DEVICE_ID = :id ORDER BY a.ASSIGNED_DATE DESC`,
      { id: req.params.id }
    );

    const audit = await db.execute(
      `SELECT * FROM INV_AUDIT WHERE DEVICE_ID = :id ORDER BY CHANGED_AT DESC FETCH FIRST 20 ROWS ONLY`,
      { id: req.params.id }
    );

    res.json({ device: dev.rows[0], assignments: assign.rows, history: audit.rows });
  } catch (e) {
    console.error('GET /devices/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

// POST /api/devices — create new device
router.post('/', auth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const { imei, serialNumber, make, model, color, storage, osType, osVersion, purchaseDate, warrantyDate, notes } = req.body;
  if (!imei || !make || !model) return res.status(400).json({ error: 'IMEI, Make, and Model are required' });

  const deviceId = uuidv4();
  try {
    await db.execute(
      `INSERT INTO INV_DEVICES (DEVICE_ID, IMEI, SERIAL_NUMBER, MAKE, MODEL, COLOR, STORAGE, OS_TYPE, OS_VERSION,
        PURCHASE_DATE, WARRANTY_DATE, NOTES, CREATED_BY)
       VALUES (:deviceId, :imei, :serialNumber, :make, :model, :color, :storage, :osType, :osVersion,
        TO_DATE(:purchaseDate, 'YYYY-MM-DD'), TO_DATE(:warrantyDate, 'YYYY-MM-DD'), :notes, :createdBy)`,
      {
        deviceId, imei, serialNumber: serialNumber || null, make, model,
        color: color || null, storage: storage || null, osType: osType || null,
        osVersion: osVersion || null, purchaseDate: purchaseDate || null,
        warrantyDate: warrantyDate || null, notes: notes || null,
        createdBy: req.user.username
      }
    );

    await db.execute(
      `INSERT INTO INV_AUDIT (DEVICE_ID, ACTION, ENTITY_TYPE, ENTITY_ID, NEW_VALUE, CHANGED_BY)
       VALUES (:deviceId, 'CREATED', 'DEVICE', :deviceId, :val, :by)`,
      { deviceId, val: `${make} ${model} IMEI:${imei}`, by: req.user.username }
    );

    res.status(201).json({ deviceId, message: 'Device created successfully' });
  } catch (e) {
    if (e.message.includes('unique') || e.message.includes('ORA-00001')) {
      return res.status(409).json({ error: 'IMEI or Serial Number already exists' });
    }
    console.error('POST /devices error:', e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/devices/:id — update device
router.put('/:id', auth, requireRole('ADMIN', 'MANAGER'), async (req, res) => {
  const { make, model, color, storage, osType, osVersion, warrantyDate, notes, status } = req.body;
  const validStatuses = ['AVAILABLE', 'ASSIGNED', 'IN_REPAIR', 'LOST', 'STOLEN', 'RETIRED'];

  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const existing = await db.execute(`SELECT STATUS FROM INV_DEVICES WHERE DEVICE_ID = :id`, { id: req.params.id });
    if (!existing.rows.length) return res.status(404).json({ error: 'Device not found' });

    await db.execute(
      `UPDATE INV_DEVICES SET
         MAKE = NVL(:make, MAKE), MODEL = NVL(:model, MODEL), COLOR = NVL(:color, COLOR),
         STORAGE = NVL(:storage, STORAGE), OS_TYPE = NVL(:osType, OS_TYPE),
         OS_VERSION = NVL(:osVersion, OS_VERSION),
         WARRANTY_DATE = NVL(TO_DATE(:warrantyDate, 'YYYY-MM-DD'), WARRANTY_DATE),
         NOTES = NVL(:notes, NOTES), STATUS = NVL(:status, STATUS),
         UPDATED_AT = CURRENT_TIMESTAMP
       WHERE DEVICE_ID = :id`,
      { make, model, color, storage, osType, osVersion, warrantyDate: warrantyDate || null, notes, status, id: req.params.id }
    );

    if (status && status !== existing.rows[0].STATUS) {
      await db.execute(
        `INSERT INTO INV_AUDIT (DEVICE_ID, ACTION, OLD_VALUE, NEW_VALUE, CHANGED_BY)
         VALUES (:id, 'STATUS_CHANGED', :old, :new, :by)`,
        { id: req.params.id, old: existing.rows[0].STATUS, new: status, by: req.user.username }
      );
    }

    res.json({ message: 'Device updated successfully' });
  } catch (e) {
    console.error('PUT /devices/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/devices/:id — soft delete (mark RETIRED)
router.delete('/:id', auth, requireRole('ADMIN'), async (req, res) => {
  try {
    await db.execute(
      `UPDATE INV_DEVICES SET STATUS = 'RETIRED', UPDATED_AT = CURRENT_TIMESTAMP WHERE DEVICE_ID = :id`,
      { id: req.params.id }
    );
    await db.execute(
      `INSERT INTO INV_AUDIT (DEVICE_ID, ACTION, NEW_VALUE, CHANGED_BY) VALUES (:id, 'RETIRED', 'Device retired', :by)`,
      { id: req.params.id, by: req.user.username }
    );
    res.json({ message: 'Device retired successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
