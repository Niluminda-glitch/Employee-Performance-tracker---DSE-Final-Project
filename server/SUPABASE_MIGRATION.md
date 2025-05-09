# Migrating to Supabase

This document provides instructions for migrating your application from a traditional PostgreSQL database to Supabase.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, instant APIs, real-time subscriptions, and storage.

## Prerequisites

Before migrating to Supabase, make sure you have:

1. A Supabase account and project created
2. Your database tables and data migrated to Supabase
3. The necessary Supabase credentials

## Required Supabase Information

To connect your application to Supabase, you'll need the following information:

1. **Supabase URL**: `https://your-project-id.supabase.co`
2. **Supabase Anon Key**: Public API key for anonymous access
3. **Supabase Service Role Key**: Private API key for server-side operations
4. **PostgreSQL Connection Information**:
   - Host: `db.your-project-id.supabase.co`
   - Port: `5432` (default)
   - User: `postgres` (default)
   - Password: Your database password
   - Database: `postgres` (default)

## Configuration Steps

### 1. Update Environment Variables

Create or update your `.env` file with the following variables:

```
# Supabase Configuration
USE_SUPABASE=true
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Supabase Direct PostgreSQL Connection (for Sequelize)
SUPABASE_DB_HOST=db.your-project-id.supabase.co
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-db-password
SUPABASE_DB_NAME=postgres
SUPABASE_DB_PORT=5432
SUPABASE_DB_SSL=true
```

### 2. Test the Connection

Run the test script to verify your connection to Supabase:

```bash
npm run test-supabase
```

### 3. Compare Database Structures

Run the migration helper script to compare your PostgreSQL and Supabase database structures:

```bash
npm run migrate-to-supabase
```

### 4. Run the Application with Supabase

Start your application using Supabase:

```bash
# Development mode
npm run dev-supabase

# Production mode
npm run start-supabase
```

## Troubleshooting

### SSL Connection Issues

If you encounter SSL connection issues, make sure:

1. `SUPABASE_DB_SSL` is set to `true`
2. The `dialectOptions` in the Sequelize configuration include SSL settings

### Authentication Issues

If you encounter authentication issues:

1. Verify your Supabase credentials
2. Check that your database password is correct
3. Ensure your IP address is allowed in Supabase's network restrictions

### Table Structure Issues

If you encounter table structure issues:

1. Compare the table structures between PostgreSQL and Supabase
2. Make sure all required tables exist in Supabase
3. Verify column names, types, and constraints match

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Sequelize Documentation](https://sequelize.org/master/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
