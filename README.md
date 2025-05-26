# 🚀 EmpTrack - Employee Performance Tracking System

Welcome to EmpTrack, a comprehensive employee performance tracking and management system with advanced AI features, analytics, and industry trend insights!

## ✨ Features

- 👥 **User Role Management**: Different dashboards for Employees, Supervisors, and Managers
- 📊 **Performance Analytics**: Track and visualize employee performance metrics
- 📈 **Industry Trends**: AI-powered insights on industry, style, and skill trends
- 💬 **AI Chatbot**: Integrated chatbot for assistance and information
- 🔔 **Notifications**: Real-time notification system for updates and reminders
- 📝 **Task Management**: Assign, track, and manage tasks with deadlines
- 👨‍👩‍👧‍👦 **Team Management**: Tools for managing team members and their performance
- 🧠 **Advanced AI Analytics**: Predictive analytics for employee performance
- 🏋️ **Wellbeing Features**: Including stretch reminders for employee health
- 🔐 **Google OAuth Authentication**: Secure login with Google accounts
- 🎯 **Role-based Access Control**: Different permissions for different user roles

## 🏗️ Project Structure

- `real-project/project`: Main React frontend application (Vite + TypeScript)
- `trends-backend`: Node.js backend server for fetching trend data and AI analytics
- `server`: Main PostgreSQL backend server with authentication and data management

## 🛠️ Technologies Used

### Frontend
- ⚛️ React 18 with TypeScript
- 🔄 Vite for fast development and building
- 🎨 Tailwind CSS for styling
- 🧩 shadcn/ui component library
- 📊 Recharts for data visualization
- 🔄 React Query for data fetching
- 🎭 Framer Motion for animations

### Backend
- 🟢 Node.js with Express.js
- 🐘 PostgreSQL database with Sequelize ORM
- 🔐 JWT authentication & Google OAuth 2.0
- 🔄 RESTful API endpoints
- 🛡️ CORS and security middleware

### AI Integration
- 🤖 OpenRouter API with DeepSeek-V3-0324 model
- 🔍 GitHub AI API for trend analysis
- 💬 ChatGPT integration for the chatbot
- 📊 AI-powered performance analytics

## 📋 Prerequisites

Before setting up the application, ensure you have the following installed on your machine:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download here](https://code.visualstudio.com/)

### 🔍 Verify Prerequisites
Open your terminal/command prompt and run:
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show 8.0.0 or higher
```

## 🚀 Complete Setup Guide (A to Z)

### 📁 Step 1: Download and Extract Project

1. **Download the project** as a ZIP file
2. **Extract** the ZIP file to your desired location (e.g., `C:\Projects\EmpTrack`)
3. **Open terminal/command prompt** and navigate to the project directory:
   ```bash
   cd path/to/your/extracted/project
   ```

### 🗄️ Step 2: Database Setup (Using Supabase - Recommended)

Since the project is configured to use **Supabase** instead of local PostgreSQL, you'll need to:

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project** in Supabase
3. **Get your database credentials** from Project Settings > Database
4. **Note down** the following details:
   - Database URL
   - API URL
   - API Key (anon/public)
   - Service Role Key

### 🔧 Step 3: Backend Server Setup

Navigate to the main backend server directory:
```bash
cd server
```

#### Install Dependencies
```bash
npm install
```

#### Create Environment Configuration
Create a `.env` file in the `server` directory:
```bash
# For Windows
copy nul .env

# For Mac/Linux
touch .env
```

Add the following configuration to the `.env` file:
```env
# Database Configuration (Supabase)
DB_HOST=your_supabase_host
DB_USER=your_supabase_user
DB_PASSWORD=your_supabase_password
DB_NAME=your_supabase_db_name
DB_PORT=5432

# JWT Secret (Generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Server Port
PORT=5000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=281968550707-7mf3ffguc7hfbpmr5f1ha6r1stodjk54.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# OpenRouter API Configuration
OPENROUTER_API_KEY=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

# GitHub AI API Configuration
GITHUB_TOKEN=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
```

#### Setup Database Tables
```bash
npm run setup-db
```

#### Start the Backend Server
```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

**✅ Verification**: You should see messages like:
- "Server running on port 5000"
- "Database connected successfully"

### 📈 Step 4: Trends Backend Setup

Open a **new terminal window** and navigate to the trends backend:
```bash
cd trends-backend
```

#### Quick Setup (Recommended for beginners)
```bash
setup-and-run.bat
```

This will automatically install dependencies and start the server.

#### Manual Setup (Alternative)
If the batch file doesn't work:
```bash
# Install dependencies
npm install axios cors dotenv express node-cache

# Create .env file
echo PORT=3001 > .env

# Start the server
node server-new.js
```

The trends backend will start on `http://localhost:3001`

**✅ Verification**: You should see "Trends backend server running on port 3001"

### 🎨 Step 5: Frontend Setup

Open a **new terminal window** and navigate to the frontend:
```bash
cd real-project/project
```

#### Install Dependencies
```bash
npm install
```

This will install all required packages including:
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui components
- Recharts for data visualization
- All other dependencies

#### Create Environment Configuration
Create a `.env` file in the `real-project/project` directory:
```bash
# For Windows
copy nul .env

# For Mac/Linux
touch .env
```

Add the following configuration:
```env
# AI API Keys
VITE_OPENROUTER_API_KEY=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
VITE_GITHUB_TOKEN=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

# Backend URLs
VITE_API_URL=http://localhost:5000
VITE_TRENDS_API_URL=http://localhost:3001

# Google OAuth
VITE_GOOGLE_CLIENT_ID=281968550707-7mf3ffguc7hfbpmr5f1ha6r1stodjk54.apps.googleusercontent.com
```

#### Start the Frontend Development Server
```bash
npm run dev
```

The frontend will start on `http://localhost:8080`

**✅ Verification**: Your browser should automatically open to `http://localhost:8080` showing the EmpTrack login page.

## 🎯 Step 6: Final Verification & Testing

### Check All Services Are Running
You should now have **3 terminal windows** open with:

1. **Backend Server** (Port 5000):
   ```bash
   # Terminal 1 - In /server directory
   npm run dev
   ```

2. **Trends Backend** (Port 3001):
   ```bash
   # Terminal 2 - In /trends-backend directory
   setup-and-run.bat
   # OR
   node server-new.js
   ```

3. **Frontend** (Port 8080):
   ```bash
   # Terminal 3 - In /real-project/project directory
   npm run dev
   ```

### Test the Application
1. **Open your browser** and go to `http://localhost:8080`
2. **Login Page**: You should see the EmpTrack login interface
3. **Google OAuth**: Click "Sign in with Google" to test authentication
4. **Dashboard**: After login, you should see the appropriate dashboard based on your role
5. **Trends Page**: Navigate to trends to test the AI-powered analytics
6. **Chatbot**: Test the AI chatbot functionality

## 🔧 Troubleshooting Common Issues

### ❌ Port Already in Use
If you get "port already in use" errors:
```bash
# Kill processes on specific ports
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### ❌ Database Connection Issues
- Verify your Supabase credentials in the `.env` file
- Check if your Supabase project is active
- Ensure the database URL is correct

### ❌ API Key Issues
- Double-check all API keys in environment files
- Ensure no extra spaces or quotes around keys
- Verify the keys are active and have proper permissions

### ❌ CORS Issues
- Make sure all three servers are running
- Check that frontend is using correct backend URLs
- Verify CORS is properly configured in backend

### ❌ Dependencies Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📱 Using the Application

### 🔐 Authentication & User Roles
- **Google OAuth**: Secure login with Google accounts
- **Role-based Access**: Different dashboards for Employees, Supervisors, and Managers
- **Email Verification**: Users must be registered in the Supabase database

### 🏠 Dashboard Features
- **Employee Dashboard**: Personal performance metrics, tasks, and notifications
- **Supervisor Dashboard**: Team management, task assignment, and team analytics
- **Manager Dashboard**: Organization-wide analytics, user management, and strategic insights

### 📊 Key Features to Test
1. **Performance Analytics**: View charts and metrics
2. **Task Management**: Create, assign, and track tasks
3. **Team Management**: Manage team members and their performance
4. **Industry Trends**: AI-powered trend analysis and insights
5. **Notifications**: Real-time updates and reminders
6. **AI Chatbot**: Get assistance and information
7. **Wellbeing Features**: Stretch reminders and health tracking

## 🚀 Production Deployment

### Frontend Deployment
```bash
cd real-project/project

# Build for production
npm run build

# Serve the built application
npm run serve
```

### Backend Deployment
```bash
cd server

# Set production environment variables
# Update .env with production database credentials

# Start production server
npm start
```

### Environment Variables for Production
Update your `.env` files with production values:
- Database URLs (production Supabase instance)
- API keys (production keys)
- Domain URLs (your production domain)
- Security keys (strong, unique values)

## 🔑 API Keys and Configuration

### Required API Keys
- **OpenRouter API**: For AI analytics and chatbot
- **GitHub Token**: For AI trend analysis
- **Google OAuth**: For authentication
- **Supabase**: For database operations

### Security Best Practices
- Never commit `.env` files to version control
- Use different API keys for development and production
- Regularly rotate API keys
- Monitor API usage and set up alerts

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Support
- Check the project's issue tracker for common problems
- Review the troubleshooting section above
- Ensure all prerequisites are properly installed

## ⚙️ Customization & Advanced Configuration

### Backend Customization
You can customize the application behavior by modifying:

- **Trends Keywords**: Update `trends-backend/server-new.js` to change trend analysis keywords
- **Database Schema**: Modify `server/models/` files to add new data fields
- **API Endpoints**: Add new routes in `server/routes/` directory
- **Authentication**: Configure additional OAuth providers in `server/routes/auth.js`

### Frontend Customization
- **UI Theme**: Update `real-project/project/tailwind.config.ts` for styling changes
- **Dashboard Layout**: Modify components in `real-project/project/src/pages/`
- **Charts & Analytics**: Customize visualizations in analytics components
- **User Interface**: Update shadcn/ui components for different designs

### AI Model Configuration
- **OpenRouter Models**: Change AI models in API calls for different capabilities
- **Prompt Engineering**: Modify AI prompts for better responses
- **Analytics Logic**: Update AI analysis algorithms in backend services

## 🔄 Development Workflow

### Making Changes
1. **Frontend Changes**: Edit files in `real-project/project/src/`
2. **Backend Changes**: Edit files in `server/` directory
3. **Trends Backend**: Edit files in `trends-backend/` directory
4. **Hot Reload**: All servers support hot reload for development

### Testing Changes
1. **Frontend**: Changes reflect immediately in browser
2. **Backend**: Restart server with `npm run dev`
3. **Database**: Use `npm run setup-db` to reset database if needed

### Adding New Features
1. **Plan**: Design the feature architecture
2. **Backend**: Add API endpoints and database models
3. **Frontend**: Create UI components and integrate APIs
4. **Test**: Verify functionality across all user roles

## 🎯 Quick Start Summary

For experienced developers, here's the quick setup:

```bash
# 1. Extract project and navigate to directory
cd path/to/extracted/project

# 2. Setup Backend
cd server
npm install
# Create .env with database and API configurations
npm run setup-db
npm run dev

# 3. Setup Trends Backend (new terminal)
cd ../trends-backend
setup-and-run.bat

# 4. Setup Frontend (new terminal)
cd ../real-project/project
npm install
# Create .env with API keys and backend URLs
npm run dev

# 5. Open browser to http://localhost:8080
```

## 🆘 Getting Help

### Common Commands
```bash
# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json && npm install

# Check running processes
netstat -ano | findstr :8080  # Windows
lsof -i :8080                 # Mac/Linux
```

### Debug Mode
Enable debug logging by adding to your `.env` files:
```env
DEBUG=true
NODE_ENV=development
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- All the open-source libraries and tools used in this project
- The development team for their contributions
- Users for their feedback and suggestions
