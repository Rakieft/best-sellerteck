const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: true,
  namedPlaceholders: true,
  multipleStatements: true
});

const testConnection = async () => {
  const connection = await pool.getConnection();
  await connection.ping();
  connection.release();
};

module.exports = {
  pool,
  query: (sql, params) => pool.execute(sql, params),
  testConnection
};
