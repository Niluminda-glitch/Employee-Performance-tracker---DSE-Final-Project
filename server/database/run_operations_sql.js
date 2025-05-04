// server/database/run_operations_sql.js
require('dotenv').config({ path: '../.env' }); // Load environment variables from .env file
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'create_operations_table.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

// Execute the SQL
async function runSQL() {
  const client = await pool.connect();
  try {
    console.log('Executing SQL to create operations table...');
    await client.query(sql);
    console.log('SQL executed successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runSQL();
