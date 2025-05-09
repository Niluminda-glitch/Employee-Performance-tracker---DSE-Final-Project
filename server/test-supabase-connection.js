/**
 * Test script to verify Supabase connection
 * Run with: node test-supabase-connection.js
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const supabaseConfig = require('./config/supabase.config');

// Set environment variable to use Supabase config
process.env.USE_SUPABASE = 'true';

async function testSupabaseConnection() {
  console.log('Testing Supabase PostgreSQL connection...');

  // Check if we have a connection string
  const connectionString = process.env.SUPABASE_CONNECTION_STRING;

  if (connectionString) {
    console.log('Using connection string from environment variables');
    console.log(`Connection string: ${connectionString.replace(/:[^:]*@/, ':****@')}`); // Hide password in logs
  } else {
    console.log('Using individual connection parameters:');
    console.log(`- Host: ${supabaseConfig.DB_HOST}`);
    console.log(`- Database: ${supabaseConfig.DB_NAME}`);
    console.log(`- User: ${supabaseConfig.DB_USER}`);
    console.log(`- Port: ${supabaseConfig.DB_PORT}`);
    console.log(`- SSL: ${supabaseConfig.DB_SSL ? 'Enabled' : 'Disabled'}`);
  }

  // Create Sequelize instance for testing
  const sequelize = connectionString
    ? new Sequelize(connectionString, {
        dialect: 'postgres',
        dialectOptions: {
          ...supabaseConfig.dialectOptions,
          // Disable prepared statements for Supavisor transaction mode
          // This is required when using port 6543
          prepare: false
        },
        logging: console.log
      })
    : new Sequelize(
        supabaseConfig.DB_NAME,
        supabaseConfig.DB_USER,
        supabaseConfig.DB_PASSWORD,
        {
          host: supabaseConfig.DB_HOST,
          port: supabaseConfig.DB_PORT,
          dialect: 'postgres',
          dialectOptions: {
            ...supabaseConfig.dialectOptions,
            // Disable prepared statements for Supavisor transaction mode
            // This is required when using port 6543
            prepare: false
          },
          logging: console.log
        }
      );

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Connection to Supabase PostgreSQL has been established successfully.');

    // Try a simple query to verify data access
    const [results] = await sequelize.query('SELECT current_database(), current_user, version()');
    console.log('\nDatabase information:');
    console.log(results[0]);

    // List tables
    console.log('\nListing tables:');
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tables.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }

  } catch (error) {
    console.error('❌ Unable to connect to Supabase PostgreSQL database:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

testSupabaseConnection();
