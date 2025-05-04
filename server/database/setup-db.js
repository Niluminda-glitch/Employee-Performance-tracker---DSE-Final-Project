// This script helps set up the PostgreSQL database
require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  // Create a client to connect to the default postgres database
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connect to default postgres database first
  });

  try {
    // Connect to the default postgres database
    await client.connect();
    console.log('Connected to PostgreSQL server');

    // Check if our database exists
    const dbName = process.env.DB_NAME || 'emptrack_db';
    const checkDbResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    // Create the database if it doesn't exist
    if (checkDbResult.rowCount === 0) {
      console.log(`Database ${dbName} does not exist, creating...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully`);
    } else {
      console.log(`Database ${dbName} already exists`);
    }

    // Close the connection to the default postgres database
    await client.end();
    console.log('Disconnected from default postgres database');

    // Connect to our database
    const dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: dbName
    });

    await dbClient.connect();
    console.log(`Connected to ${dbName} database`);

    // Read and execute the initialization SQL script
    const initSqlPath = path.join(__dirname, 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    console.log('Executing initialization SQL script...');
    await dbClient.query(initSql);
    console.log('Initialization SQL script executed successfully');

    // Close the connection to our database
    await dbClient.end();
    console.log(`Disconnected from ${dbName} database`);

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
