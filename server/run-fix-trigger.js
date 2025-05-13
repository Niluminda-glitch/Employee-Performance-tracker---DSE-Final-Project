// server/run-fix-trigger.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'emptrack_db',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function runFixTriggerSQL() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Running fix_trigger.sql...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'database', 'fix_trigger.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await client.query(sql);
    
    console.log('Successfully updated the trigger_set_timestamp function to use updated_at instead of updatedAt');
    
    // Verify the trigger function
    const result = await client.query(`
      SELECT prosrc 
      FROM pg_proc 
      WHERE proname = 'trigger_set_timestamp'
    `);
    
    if (result.rows.length > 0) {
      console.log('Trigger function source:', result.rows[0].prosrc);
    } else {
      console.log('Trigger function not found after update');
    }
    
  } catch (error) {
    console.error('Error running fix_trigger.sql:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runFixTriggerSQL();
