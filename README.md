# 🚀 EmpTrack - Employee Performance Tracking System

Welcome to EmpTrack, a comprehensive employee performance tracking and management system with advanced AI features, analytics, and industry trend insights!

## ✨ Features

- 👥 **User Role Management**: Different dashboards for Employees, Supervisors, and Managers
- 📊 **Performance Analytics**: Track and visualize employee performance metrics
- 📈 **Industry Trends**: AI-powered insights on industry, style, and skill trends
- 💬 **AI Chatbot**: Integrated chatbot for assistance and information
- 📱 **Mobile App**: Cross-platform mobile application built with Expo
- 🔔 **Notifications**: Real-time notification system for updates and reminders
- 📝 **Task Management**: Assign, track, and manage tasks with deadlines
- 👨‍👩‍👧‍👦 **Team Management**: Tools for managing team members and their performance
- 🧠 **Advanced AI Analytics**: Predictive analytics for employee performance
- 🏋️ **Wellbeing Features**: Including stretch reminders for employee health

## 🏗️ Project Structure

- `real-project/project`: Main React frontend application
- `trends-backend`: Node.js backend server for fetching trend data
- `server`: PostgreSQL backend server with authentication and data management
- `mobile-emptrack`: Expo-based mobile application

## 🛠️ Technologies Used

### Frontend
- ⚛️ React with TypeScript
- 🔄 Vite for fast development and building
- 🎨 Tailwind CSS for styling
- 🧩 shadcn/ui component library
- 📊 Recharts for data visualization
- 🔄 React Query for data fetching

### Backend
- 🟢 Node.js with Express
- 🐘 PostgreSQL database with Sequelize ORM
- 🔐 JWT authentication
- 🔄 RESTful API endpoints

### Mobile
- 📱 Expo framework
- ⚛️ React Native
- 🧭 React Navigation

### AI Integration
- 🤖 Google Gemini API for AI analytics
- 🔍 GitHub AI API for trend analysis
- 💬 ChatGPT integration for the chatbot

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (for full functionality)

### Backend Setup

#### Trends Backend
1. Navigate to the trends-backend directory:
   ```bash
   cd trends-backend
   ```

2. Run the setup and start script:
   ```bash
   setup-and-run.bat
   ```

   This will install the necessary dependencies and start the backend server on http://localhost:3001.

   Note: For a quick start with no dependencies, you can use:
   ```bash
   node simple-server.js
   ```

#### PostgreSQL Server (Optional for full functionality)
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables by creating a `.env` file:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=emptrack_db
   DB_PORT=5432

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Server Port
   PORT=5000
   ```

4. Set up the database:
   ```bash
   npm run setup-db
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the project directory:
   ```bash
   cd real-project/project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project directory with the following content:
   ```
   REACT_APP_GEMINI_API_KEY=AIzaSyAdSsqADZu0sXL2XN9aPfz58tGWIz-0Fcw
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The application will run on http://localhost:8080

### Mobile App Setup (Optional)

1. Navigate to the mobile app directory:
   ```bash
   cd mobile-emptrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Use the Expo Go app on your mobile device or an emulator to run the application

## 📱 Using the Application

### Login
- Use the authentication page to log in with your credentials
- Different dashboards will be displayed based on your role (Employee, Supervisor, or Manager)

### Dashboard Navigation
- The sidebar menu provides access to different features
- Notifications are displayed in the top navigation bar
- Profile settings can be accessed from the user menu

### Using the Trends Feature
1. Log in as a Manager or Supervisor
2. Click on the "View Industry Trends" button on the dashboard
3. The Trends page will display:
   - Industry trends based on Google Trends data
   - Style trends based on Google Trends data
   - Skills trends based on Google Trends data
   - AI-powered strategic suggestions based on the trend data

### Using the Chatbot
- Click on the chat icon in the bottom right corner
- Type your question or request
- The AI-powered chatbot will provide assistance

## ⚙️ Customization

### Backend Customization

You can customize the keywords used for fetching trend data by modifying the `trends-backend/server.js` file:

- For industry trends: Update the `keyword` parameter in the `googleTrends.interestOverTime` call
- For style trends: Update the `keyword` parameter in the `googleTrends.relatedQueries` call
- For skill trends: Update the `keyword` parameter in the `googleTrends.relatedQueries` call

### Frontend Customization

- Modify the UI and behavior of the Trends page in `real-project/project/src/pages/TrendsPage.jsx`
- Customize dashboard components in the respective page files
- Update the theme in `tailwind.config.ts`

## 🔑 API Keys and Configuration

- **Google Gemini API**: The API key is stored in the `.env` file in the frontend project directory
- **GitHub AI API**: Used for trend analysis with token configuration
- **ChatGPT API**: Configured for the chatbot integration

## 🔧 Troubleshooting

- **CORS Issues**: Make sure the backend server is running and the frontend is configured to use the correct backend URL
- **API Key Issues**: Check that all API keys are correctly set in the `.env` files
- **Database Connection**: Verify PostgreSQL is running and the connection details are correct
- **Mobile App**: For Expo issues, check the Expo documentation or run `expo doctor`

## 🌐 Deployment

### Frontend Deployment
1. Build the frontend:
   ```bash
   cd real-project/project
   npm run build
   ```
2. The build output will be in the `dist` directory
3. Serve the static files using the included Express server:
   ```bash
   npm run serve
   ```

### Backend Deployment
1. Set up your production environment variables
2. Start the server:
   ```bash
   npm start
   ```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- All the open-source libraries and tools used in this project
- The development team for their contributions
- Users for their feedback and suggestions
