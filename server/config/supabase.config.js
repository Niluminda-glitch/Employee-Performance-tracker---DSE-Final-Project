/**
 * Supabase configuration for database connection
 * This file contains the configuration for connecting to Supabase PostgreSQL database
 */

module.exports = {
  // Supabase connection details
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Direct PostgreSQL connection to Supabase (for Sequelize)
  DB_HOST: process.env.DB_HOST || "aws-0-us-west-1.pooler.supabase.com",
  DB_USER: process.env.DB_USER || "postgres.sqtwsuvwwynibcuwcjlc",
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME || "postgres",
  DB_PORT: process.env.DB_PORT || 5432,
  DB_SSL: process.env.DB_SSL !== 'false', // Default to true

  // Connection pool configuration
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // Dialect is still postgres
  dialect: "postgres",

  // SSL configuration for Sequelize
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // You might want to set this to true in production
    }
  }
};
