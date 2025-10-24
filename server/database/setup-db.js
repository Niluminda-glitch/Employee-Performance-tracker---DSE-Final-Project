require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log(`✅ Successfully connected to Supabase database: ${process.env.DB_HOST}`);

    const initSqlPath = path.join(__dirname, 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    console.log('⚙️  Executing init.sql to create tables...');
    await client.query(initSql);
    console.log('✅ Tables created successfully from init.sql');

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ ERROR during database setup:', error.message);
    process.exit(1);
  } finally {
    if (client._connected) {
      await client.end();
      console.log('🔌 Connection to database closed.');
    }
  }
}

setupDatabase();