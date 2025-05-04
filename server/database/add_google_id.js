// Script to add google_id column to users table
require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function addGoogleIdColumn() {
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
    const sqlPath = path.join(__dirname, 'add_google_id.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing SQL script to add google_id column...');
    const result = await client.query(sql);
    console.log('SQL script executed successfully');

    // Close the connection
    await client.end();
    console.log('Disconnected from PostgreSQL database');
    console.log('Google ID and avatar URL columns added successfully (if they didn\'t exist already)');
  } catch (error) {
    console.error('Error adding google_id column:', error);
    process.exit(1);
  }
}

addGoogleIdColumn();
