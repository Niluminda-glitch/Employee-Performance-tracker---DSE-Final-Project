// server/update-user-status.js
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'emptrack_db',
  password: process.env.DB_PASSWORD || '1234',
  port: process.env.DB_PORT || 5432,
});

async function updateUserStatus() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Updating user status...');
    
    // Hash the new password
    const newPassword = 'newpassword123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user directly in the database
    const result = await client.query(
      `UPDATE users SET password = $1, status = $2, updated_at = NOW() WHERE email = $3 RETURNING id, email, status`,
      [hashedPassword, 'active', 'lal2@gmail.com']
    );
    
    if (result.rows.length > 0) {
      console.log('User updated successfully:');
      console.log(result.rows[0]);
    } else {
      console.log('No user found with email lal2@gmail.com');
    }
    
  } catch (error) {
    console.error('Error updating user status:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateUserStatus();
