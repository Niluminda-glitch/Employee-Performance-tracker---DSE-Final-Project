# 📚 EmpTrack API Documentation

## 🎯 Overview

This directory contains comprehensive API documentation for the EmpTrack Employee Management System. The documentation is built using **Swagger/OpenAPI 3.0** and provides interactive API exploration capabilities.

## 🚀 Quick Start

### Accessing the Documentation

1. **Start the server**:
   ```bash
   cd server
   npm start
   ```

2. **Open Swagger UI**:
   - Navigate to: http://localhost:5000/api-docs
   - Interactive documentation with "Try it out" functionality

3. **Get Raw OpenAPI Spec**:
   - JSON format: http://localhost:5000/api-docs.json

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Running EmpTrack server

### Installation
The Swagger dependencies are already installed:
```bash
npm install swagger-jsdoc swagger-ui-express
```

### Configuration Files
- `server/swagger.js` - Main Swagger configuration
- `server/docs/swagger.yaml` - API endpoint definitions
- `server/docs/README.md` - This documentation file

## 📖 API Documentation Structure

### 🔐 Authentication
- **JWT Tokens**: Most endpoints require authentication
- **Google OAuth**: Social login integration
- **Role-based Access**: Employee, Supervisor, Manager roles

### 📋 Main API Categories

#### 1. **Authentication** (`/api/auth`)
- User login and registration
- Google OAuth integration
- JWT token management

#### 2. **User Management** (`/api/users`)
- User CRUD operations
- Profile management
- Role-based access control

#### 3. **Task Management** (`/api/tasks`)
- Create, assign, and track tasks
- Deadline management
- Team task overview

#### 4. **Department Management** (`/api/departments`)
- Department CRUD operations
- Employee-department associations

#### 5. **Skills Management** (`/api/skills`)
- Skill catalog management
- User skill associations
- Proficiency tracking

#### 6. **Mentorship System** (`/api/mentors`)
- Find mentors by skill
- Mentorship requests
- Skill-based matching

#### 7. **Notifications** (`/api/notifications`)
- System notifications
- Task-related alerts
- User communication

#### 8. **Request Management** (`/api/requests`)
- Leave requests
- Overtime requests
- Approval workflows

#### 9. **Analytics** (`/api/analytics`)
- Performance analysis
- AI-powered insights
- Reporting features

#### 10. **Trends API** (`/api/trends`) - Port 3001
- Industry trends
- Style trends
- Skill trends

## 🔑 Authentication Guide

### Getting a JWT Token

1. **Login with credentials**:
   ```bash
   POST /api/auth/login
   {
     "email": "user@example.com",
     "password": "password123"
   }
   ```

2. **Use the token in requests**:
   ```bash
   # Option 1: x-auth-token header
   curl -H "x-auth-token: YOUR_JWT_TOKEN" http://localhost:5000/api/users/me
   
   # Option 2: Authorization header
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:5000/api/users/me
   ```

### Google OAuth Flow
1. Navigate to `/api/auth/google`
2. Complete Google authentication
3. Receive JWT token in callback

## 📊 Database Schema

### Core Models
- **Users**: Employee information and authentication
- **Tasks**: Work assignments and tracking
- **Departments**: Organizational structure
- **Skills**: Skill catalog and proficiency
- **Notifications**: System communications
- **Requests**: Leave and overtime management

### Key Relationships
- Users belong to Departments
- Users have Supervisors (self-referential)
- Tasks are assigned to Users
- Users have many Skills (many-to-many)
- Notifications belong to Users

## 🎨 Using Swagger UI

### Interactive Features
1. **Try It Out**: Test endpoints directly from the browser
2. **Authentication**: Use the "Authorize" button to set JWT tokens
3. **Schema Validation**: Real-time request/response validation
4. **Code Generation**: Generate client code in multiple languages

### Testing Workflow
1. Start with authentication endpoints
2. Get a JWT token
3. Use "Authorize" button to set the token
4. Test protected endpoints
5. Explore different user roles

## 🔧 Customization

### Adding New Endpoints
1. Add route definitions to `swagger.yaml`
2. Include proper schemas and examples
3. Update security requirements
4. Test in Swagger UI

### Modifying Schemas
1. Edit schemas in `swagger.js`
2. Ensure consistency with database models
3. Update related endpoint definitions
4. Validate with real API responses

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" errors
**Solution**: Ensure JWT token is properly set in Swagger UI authorization

### Issue: CORS errors
**Solution**: Server is configured to allow all origins for development

### Issue: Schema validation errors
**Solution**: Check that request body matches the defined schema

### Issue: 404 errors
**Solution**: Verify the server is running on the correct port (5000)

## 📝 API Testing Examples

### Basic User Flow
```bash
# 1. Login
POST /api/auth/login
{
  "email": "john.doe@example.com",
  "password": "password123"
}

# 2. Get profile
GET /api/users/me
Headers: x-auth-token: <JWT_TOKEN>

# 3. Get tasks
GET /api/tasks/my
Headers: x-auth-token: <JWT_TOKEN>

# 4. Create notification
POST /api/notifications
Headers: x-auth-token: <JWT_TOKEN>
{
  "user_id": "user-uuid",
  "title": "Test Notification",
  "message": "This is a test",
  "type": "system"
}
```

## 🔄 Development Workflow

### Making Changes
1. Update API endpoints in your route files
2. Update corresponding Swagger documentation
3. Test endpoints in Swagger UI
4. Validate with real client applications

### Best Practices
- Keep documentation in sync with code
- Use descriptive examples
- Include error scenarios
- Test all authentication flows
- Validate schema definitions

## 📞 Support

For questions about the API documentation:
- Check the interactive Swagger UI
- Review the source code in `/routes` directory
- Test endpoints with provided examples
- Refer to the database schema documentation

## 🔗 Related Resources

- **Main Application**: http://localhost:5173 (Frontend)
- **API Server**: http://localhost:5000 (Backend)
- **Trends API**: http://localhost:3001 (Trends Backend)
- **Database**: Supabase PostgreSQL
- **Documentation**: http://localhost:5000/api-docs
