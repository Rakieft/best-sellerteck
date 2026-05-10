const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const env = require('../config/env');

const runSchema = async () => {
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    multipleStatements: true
  });

  await connection.query(sql);
  await connection.end();
  console.log('Database schema executed successfully.');
  process.exit(0);
};

runSchema().catch((error) => {
  console.error('Schema execution failed:', error.message);
  process.exit(1);
});
