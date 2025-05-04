// Script to hash all plain text passwords in the database
require('dotenv').config({ path: '../.env' });
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function hashAllPasswords() {
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

    // Get all users
    const { rows } = await client.query('SELECT id, email, password FROM public.users');
    console.log(`Found ${rows.length} users in the database`);

    let updatedCount = 0;

    // Check each user's password
    for (const user of rows) {
      // Skip users with no password
      if (!user.password) {
        console.log(`User ${user.email} has no password, skipping`);
        continue;
      }

      // Check if the password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`User ${user.email} already has a hashed password, skipping`);
        continue;
      }

      // Hash the plain text password
      console.log(`Hashing password for user ${user.email}`);
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Update the user's password in the database
      await client.query(
        'UPDATE public.users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );

      updatedCount++;
    }

    // Close the connection
    await client.end();
    console.log('Disconnected from PostgreSQL database');
    console.log(`Updated passwords for ${updatedCount} user(s)`);
  } catch (error) {
    console.error('Error hashing passwords:', error);
    process.exit(1);
  }
}

hashAllPasswords();
