const mysql = require('mysql2/promise');

// Prefer IPv4 when DB_HOST is set to 'localhost' (some systems resolve localhost to ::1 first)
const dbHostEnv = process.env.DB_HOST;
const host = dbHostEnv === 'localhost' || !dbHostEnv ? '127.0.0.1' : dbHostEnv;

const pool = mysql.createPool({
  host,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ctf_collection',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
