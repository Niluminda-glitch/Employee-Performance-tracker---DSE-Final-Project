const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('./config/db.config');

// Create a connection pool using the same config as your application
const pool = new Pool({
  user: config.USER,
  host: config.HOST,
  database: config.DB,
  password: config.PASSWORD,
  port: config.PORT,
});

async function runSqlScript() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../SQL/add_request_submitted_notification_type.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
      console.error('SQL file not found!');
      return;
    }
    
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('SQL script content:');
    console.log(sqlScript);
    
    // Execute the SQL
    console.log('Connecting to database...');
    const client = await pool.connect();
    try {
      console.log('Executing SQL script...');
      await client.query(sqlScript);
      console.log('SQL script executed successfully');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error executing SQL script:', err);
  } finally {
    pool.end();
  }
}

runSqlScript();
