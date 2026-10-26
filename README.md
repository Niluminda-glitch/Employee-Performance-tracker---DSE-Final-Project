# 🚀 EmpTrack - Employee Performance Tracking System

Welcome to EmpTrack, a comprehensive employee performance tracking and management system with advanced AI features, analytics, and industry trend insights!

---

## ✨ Features

- 👥 **User Role Management**: Dedicated dashboards for Employees, Supervisors, and Managers.
- 📊 **Performance Analytics**: Visualizations and tracking for employee performance metrics.
- 📈 **Industry Trends**: AI-powered insights on industry, style, and skill trends.
- 💬 **AI Assistance**: Integrated assistant for information and performance queries.
- 🔔 **Notifications**: Real-time notification system for updates and reminders.
- 📝 **Task Management**: Assign, track, and manage tasks with deadlines.
- 👨‍👩‍👧‍👦 **Team Management**: Managerial tools for managing team members and performance.
- 🔐 **Authentication**: Secure JWT-based login and Google OAuth 2.0 support.
- 🎯 **Role-Based Access Control (RBAC)**: Fine-grained permissions across user roles.

---

## 🏗️ Project Structure

```text
├── real-project/project/    # React frontend application (Vite + TypeScript + Tailwind CSS)
├── server/                  # Main Express backend server (PostgreSQL / Supabase with Sequelize)
├── trends-backend/          # Node.js backend service for trend analysis and AI insights
├── MobileApp/               # Mobile application workspace / assets
├── SQL/                     # Database scripts and migration files
├── DatabaseBackup/          # Database backup files
└── README.md                # Project documentation
```

---

## 🛠️ Technologies Used

### Frontend (`real-project/project`)
- ⚛️ **React 18** with **TypeScript**
- 🔄 **Vite** for fast development and bundling
- 🎨 **Tailwind CSS** & **shadcn/ui** component library
- 📊 **Recharts** for interactive charts and data visualization
- 🔄 **React Query** (`@tanstack/react-query`) for efficient data fetching

### Main Backend (`server`)
- 🟢 **Node.js** with **Express.js**
- 🐘 **PostgreSQL** / **Supabase** with **Sequelize ORM**
- 🔐 **JWT** & **Passport.js** with Google OAuth 2.0
- 📖 **Swagger UI** for API documentation (`/api-docs`)

### Trends Backend (`trends-backend`)
- 🟢 **Node.js** with **Express.js**
- ⚡ **Node-Cache** & **Axios** for external API caching and requests

---

## 📋 Prerequisites

Before running the system, ensure you have installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v8.0.0 or higher (included with Node.js)
- **Git**: ([Download](https://git-scm.com/))

Verify your environment:
```bash
node -v
npm -v
```

---

## 🚀 Quick Setup & Local Development

### 1️⃣ Setup Main Backend Server (`server/`)

```bash
cd server
npm install
```

Ensure `.env` exists in `server/` with the required configuration:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
USE_SUPABASE=true
SUPABASE_CONNECTION_STRING=your_postgres_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
```

Start the main backend server:
```bash
npm run start
```

---

### 2️⃣ Setup Trends Backend Server (`trends-backend/`)

In a new terminal window:
```bash
cd trends-backend
npm install
node server-new.js
```

The trends backend runs on `http://localhost:3001`.

---

### 3️⃣ Setup Frontend Application (`real-project/project/`)

In a new terminal window:
```bash
cd real-project/project
npm install
```

Ensure `.env` exists in `real-project/project/` with:
```env
VITE_API_URL=http://localhost:5000
VITE_TRENDS_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Run the development server or build for production:
```bash
# Start Vite development server
npm run dev

# Or build for production verification
npm run build
```

The frontend will run locally on `http://localhost:8080` (or `http://localhost:5173`).

---

## 🧪 Testing & Verification

- **Frontend Build**: `cd real-project/project && npm run build`
- **Main Backend**: `cd server && npm start`
- **Trends Backend**: `cd trends-backend && node server-new.js`

---

## 📝 License

This project is licensed under the MIT License.
