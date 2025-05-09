/**
 * Script to help migrate from PostgreSQL to Supabase
 * This script will:
 * 1. Test the connection to both databases
 * 2. List tables and their structures
 * 3. Provide guidance on migration
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const pgConfig = require('../config/db.config');
const supabaseConfig = require('../config/supabase.config');

// Create Sequelize instances for both databases
const pgSequelize = new Sequelize(
  pgConfig.DB,
  pgConfig.USER,
  pgConfig.PASSWORD,
  {
    host: pgConfig.HOST,
    port: pgConfig.PORT,
    dialect: 'postgres',
    logging: false
  }
);

const supabaseSequelize = new Sequelize(
  supabaseConfig.DB_NAME,
  supabaseConfig.DB_USER,
  supabaseConfig.DB_PASSWORD,
  {
    host: supabaseConfig.DB_HOST,
    port: supabaseConfig.DB_PORT,
    dialect: 'postgres',
    dialectOptions: supabaseConfig.dialectOptions,
    logging: false
  }
);

async function testConnections() {
  console.log('Testing database connections...\n');
  
  // Test PostgreSQL connection
  try {
    await pgSequelize.authenticate();
    console.log('✅ Connection to PostgreSQL database successful.');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
  }
  
  // Test Supabase connection
  try {
    await supabaseSequelize.authenticate();
    console.log('✅ Connection to Supabase PostgreSQL successful.');
  } catch (error) {
    console.error('❌ Supabase connection error:', error.message);
  }
  
  console.log('\n');
}

async function listTables(sequelize, dbName) {
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`Tables in ${dbName}:`);
    if (tables.length === 0) {
      console.log('  No tables found');
    } else {
      tables.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    return tables.map(t => t.table_name);
  } catch (error) {
    console.error(`Error listing tables in ${dbName}:`, error.message);
    return [];
  }
}

async function compareTableStructures(pgTables, supaTables) {
  console.log('\nComparing table structures:');
  
  const missingInSupabase = pgTables.filter(table => !supaTables.includes(table));
  const extraInSupabase = supaTables.filter(table => !pgTables.includes(table));
  
  if (missingInSupabase.length > 0) {
    console.log('\n⚠️ Tables in PostgreSQL but missing in Supabase:');
    missingInSupabase.forEach(table => console.log(`  - ${table}`));
  }
  
  if (extraInSupabase.length > 0) {
    console.log('\n⚠️ Tables in Supabase but not in PostgreSQL:');
    extraInSupabase.forEach(table => console.log(`  - ${table}`));
  }
  
  const commonTables = pgTables.filter(table => supaTables.includes(table));
  console.log(`\n✅ Common tables (${commonTables.length}):`);
  commonTables.forEach(table => console.log(`  - ${table}`));
  
  return commonTables;
}

async function main() {
  console.log('=== PostgreSQL to Supabase Migration Helper ===\n');
  
  await testConnections();
  
  const pgTables = await listTables(pgSequelize, 'PostgreSQL');
  console.log('');
  const supaTables = await listTables(supabaseSequelize, 'Supabase');
  
  const commonTables = await compareTableStructures(pgTables, supaTables);
  
  console.log('\n=== Migration Guidance ===');
  console.log('1. Make sure all tables from PostgreSQL exist in Supabase');
  console.log('2. Verify table structures match between the two databases');
  console.log('3. Update your .env file with Supabase connection details');
  console.log('4. Set USE_SUPABASE=true in your .env file');
  console.log('5. Test your application with the new database');
  
  // Close connections
  await pgSequelize.close();
  await supabaseSequelize.close();
}

main().catch(error => {
  console.error('Error in migration helper:', error);
  process.exit(1);
});
