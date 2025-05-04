# PostgreSQL Backend Server

This is a Node.js/Express backend server with PostgreSQL database integration using Sequelize ORM. It includes authentication with JWT, bcryptjs for password hashing, and Google OAuth integration.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

## Setup Instructions

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Rename `.env.example` to `.env` and update the values:

```
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=emptrack_db
DB_PORT=5432

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Server Port
PORT=5000
```

3. **Set up the PostgreSQL database**

You can set up the database in two ways:

**Option 1: Using the setup script**

```bash
# Run the database setup script
npm run setup-db
```

**Option 2: Manual setup**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE emptrack_db;

# Connect to the database
\c emptrack_db

# Exit psql
\q

# Run the initialization script
psql -U postgres -d emptrack_db -f database/init.sql
```

4. **Run the server**

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user profile (requires authentication)

### User Management

- `GET /api/users` - Get all users (requires supervisor/manager role)
- `GET /api/users/:id` - Get user by ID (requires supervisor/manager role)
- `GET /api/users/role/:role` - Get users by role (requires supervisor/manager role)
- `GET /api/users/supervisors` - Get all supervisors (requires authentication)
- `PUT /api/users/:id` - Update user (requires manager role)
- `DELETE /api/users/:id` - Delete user (requires manager role)

## Authentication

All protected routes require a valid JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Login API Details

The `/api/auth/login` endpoint accepts:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

And returns:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "full_name": "Test User",
    "email": "test@example.com",
    "role": "manager",
    "status": "active",
    "avatar_url": null,
    "department_id": null,
    "supervisor_id": null
  }
}
```

## Test Users

The database initialization script creates the following test users:

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

## Database Models

### User Model

- `id` - UUID (primary key)
- `email` - String (unique, required)
- `password` - String (hashed, nullable for Google OAuth users)
- `name` - String (required)
- `role` - Enum ('employee', 'supervisor', 'manager')
- `status` - Enum ('active', 'inactive', 'first_login')
- `job_title` - String (optional)
- `department` - String (optional)
- `supervisor_id` - UUID (foreign key to users.id, optional)
- `google_id` - String (unique, optional)
- `avatar_url` - String (optional)
- `createdAt` - Date (auto-generated)
- `updatedAt` - Date (auto-generated)

## Google OAuth Integration

To use Google OAuth:

1. Create a Google Cloud project
2. Configure OAuth consent screen
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs
5. Update the `.env` file with your Google client ID and secret

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Make sure PostgreSQL is running
2. Check that the database credentials in `.env` are correct
3. Ensure the database exists
4. Check for any PostgreSQL-specific errors in the console

### Authentication Issues

If you encounter authentication issues:

1. Make sure the JWT_SECRET in `.env` is set
2. Check that the user exists in the database
3. Verify that the password is correct
4. Ensure the user status is 'active'
