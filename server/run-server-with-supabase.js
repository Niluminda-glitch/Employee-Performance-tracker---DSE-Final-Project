/**
 * Simple script to run the server with Supabase
 */

// Set the environment variable
process.env.USE_SUPABASE = 'true';

// Import the server
require('./server.js');
