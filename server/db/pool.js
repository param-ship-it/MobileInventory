// db/pool.js — Oracle connection pool shared across all routes
'use strict';
require('dotenv').config();
const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

async function initialize() {
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    poolTimeout: 60,
  });
  console.log('✅ Oracle connection pool created');
}

async function close() {
  if (pool) await pool.close(0);
}

async function execute(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, binds, { ...opts, outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

async function executeMany(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.executeMany(sql, binds, opts);
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = { initialize, close, execute, executeMany };
