require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  const connectionString = process.env.SUPABASE_CONNECTION_STRING;
  console.log('Connection string (masked):', connectionString.replace(/:[^:]*@/, ':****@'));
  
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('Database info:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();
