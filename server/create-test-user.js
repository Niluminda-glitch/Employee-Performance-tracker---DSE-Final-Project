// server/create-test-user.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'emptrack_db',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function createTestUser() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Creating test user...');
    
    // Generate a UUID for the new user
    const userId = uuidv4();
    
    // Hash the initial password
    const initialPassword = 'password123';
    const hashedPassword = await bcrypt.hash(initialPassword, 10);
    
    // Create a test user with first_login status
    const result = await client.query(
      `INSERT INTO users (
        id, email, full_name, role, status, password, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, NOW(), NOW()
      ) RETURNING id, email, status`,
      [
        userId,
        'testuser@example.com',
        'Test User',
        'employee',
        'first_login',
        hashedPassword
      ]
    );
    
    if (result.rows.length > 0) {
      console.log('Test user created successfully:');
      console.log(result.rows[0]);
      console.log('Initial password: password123');
    } else {
      console.log('Failed to create test user');
    }
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createTestUser();
