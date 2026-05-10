const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const runSeed = async () => {
  const seedPath = path.resolve(process.cwd(), 'database', 'seed.sql');
  const sql = fs.readFileSync(seedPath, 'utf8');
  await db.pool.query(sql);
  console.log('Database seed executed successfully.');
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('Seed execution failed:', error.message);
  process.exit(1);
});
