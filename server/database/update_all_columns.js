// Script to update all columns in the users table
require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function updateAllColumns() {
  // Create a client to connect to the database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'emptrack_db'
  });

  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to PostgreSQL database');

    // Read and execute the SQL script
    const sqlPath = path.join(__dirname, 'update_all_columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL script to update all columns...');
    const result = await client.query(sql);
    console.log('SQL script executed successfully');

    // Close the connection
    await client.end();
    console.log('Disconnected from PostgreSQL database');
    console.log('All columns updated successfully');
  } catch (error) {
    console.error('Error updating columns:', error);
    process.exit(1);
  }
}

updateAllColumns();
