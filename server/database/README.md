# PostgreSQL Database Setup

This directory contains SQL scripts for setting up the PostgreSQL database for the application.

## Prerequisites

- PostgreSQL installed on your system
- psql command-line tool or pgAdmin for executing SQL scripts

## Setup Instructions

1. **Create the database**

```bash
# Connect to PostgreSQL as a superuser
psql -U postgres

# Create the database
CREATE DATABASE emptrack_db;

# Connect to the new database
\c emptrack_db

# Exit psql
\q
```

2. **Run the initialization script**

```bash
# Run the init.sql script
psql -U postgres -d emptrack_db -f init.sql
```

Alternatively, you can use pgAdmin to execute the SQL script.

## Test Users

The initialization script creates the following test users:

1. **Manager**
   - Email: test@example.com
   - Password: password123
   - Role: manager

2. **Supervisor**
   - Email: supervisor@example.com
   - Password: password123
   - Role: supervisor

3. **Employee**
   - Email: employee@example.com
   - Password: password123
   - Role: employee

## Database Schema

The database schema includes the following tables:

- **users**: Stores user information including authentication details and role

The schema also includes the following ENUM types:

- **user_role**: 'employee', 'supervisor', 'manager'
- **user_status**: 'active', 'inactive', 'first_login'
- **skill_proficiency**: 'learning', 'proficient', 'expert'
- **task_status**: 'pending', 'in-progress', 'completed'
- **task_priority**: 'low', 'medium', 'high'
- **notification_type**: 'system', 'task_assigned', 'task_completed', 'deadline_reminder', 'mentorship_request', 'request_approved', 'request_rejected', 'announcement'
- **mentorship_status**: 'pending', 'accepted', 'rejected'
