// routes/reports.js
'use strict';
const router = require('express').Router();
const db = require('../db/pool');
const { auth } = require('../middleware/auth');

// GET /api/reports/summary — dashboard KPIs
router.get('/summary', auth, async (req, res) => {
  try {
    const statusCount = await db.execute(
      `SELECT STATUS, COUNT(*) AS CNT FROM INV_DEVICES GROUP BY STATUS ORDER BY STATUS`
    );

    const totals = { TOTAL: 0, AVAILABLE: 0, ASSIGNED: 0, IN_REPAIR: 0, LOST: 0, STOLEN: 0, RETIRED: 0 };
    for (const row of statusCount.rows) {
      totals[row.STATUS] = row.CNT;
      totals.TOTAL += row.CNT;
    }

    const makeBreakdown = await db.execute(
      `SELECT MAKE, COUNT(*) AS CNT FROM INV_DEVICES WHERE STATUS != 'RETIRED' GROUP BY MAKE ORDER BY CNT DESC`
    );

    const recentActivity = await db.execute(
      `SELECT a.ACTION, a.CHANGED_BY, a.CHANGED_AT,
              d.MAKE, d.MODEL, d.IMEI
       FROM INV_AUDIT a
       LEFT JOIN INV_DEVICES d ON d.DEVICE_ID = a.DEVICE_ID
       ORDER BY a.CHANGED_AT DESC FETCH FIRST 10 ROWS ONLY`
    );

    const weeklyTrend = await db.execute(
      `SELECT TRUNC(CHANGED_AT, 'DD') AS DAY, COUNT(*) AS CNT
       FROM INV_AUDIT
       WHERE CHANGED_AT >= SYSDATE - 7
       GROUP BY TRUNC(CHANGED_AT, 'DD')
       ORDER BY DAY`
    );

    res.json({
      totals,
      makeBreakdown: makeBreakdown.rows,
      recentActivity: recentActivity.rows,
      weeklyTrend: weeklyTrend.rows
    });
  } catch (e) {
    console.error('GET /reports/summary error:', e);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/aging — devices assigned > N days
router.get('/aging', auth, async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const result = await db.execute(
      `SELECT d.MAKE, d.MODEL, d.IMEI, d.COLOR,
              a.ASSIGNED_TO_NAME, a.ASSIGNMENT_TYPE,
              a.ASSIGNED_DATE,
              ROUND(SYSDATE - CAST(a.ASSIGNED_DATE AS DATE)) AS DAYS_ASSIGNED,
              u.FULL_NAME AS ASSIGNED_TO_FULLNAME,
              p.NAME AS PROGRAM_NAME
       FROM INV_ASSIGNMENTS a
       JOIN INV_DEVICES d ON d.DEVICE_ID = a.DEVICE_ID
       LEFT JOIN INV_USERS u ON u.USER_ID = a.ASSIGNED_TO_USER
       LEFT JOIN INV_PROGRAMS p ON p.PROGRAM_ID = a.PROGRAM_ID
       WHERE a.IS_ACTIVE = 1
         AND (SYSDATE - CAST(a.ASSIGNED_DATE AS DATE)) > :days
       ORDER BY DAYS_ASSIGNED DESC`,
      { days }
    );
    res.json({ days, data: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/reports/by-program
router.get('/by-program', auth, async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT p.NAME AS PROGRAM, COUNT(*) AS DEVICE_COUNT
       FROM INV_ASSIGNMENTS a
       JOIN INV_PROGRAMS p ON p.PROGRAM_ID = a.PROGRAM_ID
       WHERE a.IS_ACTIVE = 1 AND a.PROGRAM_ID IS NOT NULL
       GROUP BY p.NAME ORDER BY DEVICE_COUNT DESC`
    );
    res.json({ data: result.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
