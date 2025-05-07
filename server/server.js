// server/server.js
require('dotenv').config(); // Load .env variables FIRST
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const db = require('./models'); // Imports models/index.js which initializes Sequelize
const authRoutes = require('./routes/auth'); // Using our new auth.js file
const userRoutes = require('./routes/user.routes');
const supervisorRoutes = require('./routes/supervisor'); // Import supervisor routes
const managerRoutes = require('./routes/manager'); // Import manager routes
const taskRoutes = require('./routes/tasks'); // Import task routes
const departmentRoutes = require('./routes/departments'); // Import department routes
const operationRoutes = require('./routes/operations'); // Import operations routes
const skillRoutes = require('./routes/skills'); // Import skills routes
const userSkillRoutes = require('./routes/user-skills'); // Import user-skills routes
const mentorRoutes = require('./routes/mentors'); // Import mentors routes
const notificationRoutes = require('./routes/notifications'); // Import notification routes
const requestRoutes = require('./routes/requests'); // Import request routes
const analyticsRoutes = require('./routes/analytics'); // Import analytics routes
const directUpdateRoutes = require('./routes/direct-update'); // Import direct update routes
const authMiddleware = require('./middleware/authMiddleware'); // Import the new auth middleware

const app = express();
const PORT = process.env.PORT || 5000; // Use PORT from .env or default

// --- Middleware ---
// Enable CORS for requests from your frontend origin
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Initialize Passport
app.use(passport.initialize());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`[Server] ${req.method} ${req.url}`);

  // Log request headers for debugging
  if (req.url.includes('/tasks/my/upcoming') || req.url.includes('/tasks/test-upcoming')) {
    console.log('[Server] IMPORTANT - Upcoming deadlines endpoint called');
    console.log('[Server] Request headers:', req.headers);
    console.log('[Server] Auth token:', req.headers['x-auth-token']);
  }

  next();
});

// --- API Routes ---
app.get('/api', (req, res) => res.send('EmpTrack Backend API is running!')); // Simple API test route

// Direct test endpoint for upcoming deadlines (NO AUTH REQUIRED)
app.get('/api/test-upcoming', (req, res) => {
  console.log('[Server] Direct test endpoint for upcoming deadlines called');
  res.json({ count: 0, message: 'Direct test endpoint working correctly' });
});

// Public Routes (No middleware needed before these)
app.use('/api/auth', authRoutes); // Login/Register routes are public

// Add specific route for /api/users/me
app.get('/api/users/me', authMiddleware, async (req, res) => {
    try {
        // authMiddleware has run, so req.user is available
        console.log(`Fetching profile for authenticated user: ${req.user.id}`);
        // Fetch user details from DB using req.user.id, excluding password
        const userProfile = await db.User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'google_id'] }, // Exclude sensitive data
            include: [
                // Include department information
                {
                    model: db.Department,
                    as: 'userDepartment', // Use the same alias defined in models/index.js
                    attributes: ['id', 'name']
                },
                // Include supervisor information
                {
                    model: db.User,
                    as: 'supervisor',
                    attributes: ['id', 'full_name', 'email', 'role']
                }
            ]
        });
        if (!userProfile) {
            // Should ideally not happen if token was valid for an existing user
            return res.status(404).json({ message: "User profile not found." });
        }
        res.json(userProfile);
    } catch(error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error retrieving user profile." });
    }
});

// Apply middleware to other user routes
app.use('/api/users', authMiddleware, userRoutes);

// Mount supervisor routes
app.use('/api/supervisor', authMiddleware, supervisorRoutes);

// Mount manager routes
app.use('/api/manager', managerRoutes); // Protection is handled inside manager.js

// Mount task routes
app.use('/api/tasks', authMiddleware, taskRoutes); // Apply middleware explicitly
console.log('[Server] Task routes registered with auth middleware');

// Log all task routes for debugging
console.log('[Server] Task routes:');
taskRoutes.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`[Server] ${Object.keys(r.route.methods).join(', ').toUpperCase()} /api/tasks${r.route.path}`);
  }
});

// Mount department routes
app.use('/api/departments', authMiddleware, departmentRoutes); // Apply middleware explicitly

// Mount operations routes
app.use('/api/operations', authMiddleware, operationRoutes); // Apply middleware

// Mount skills routes
app.use('/api/skills', authMiddleware, skillRoutes); // Apply middleware explicitly

// Mount user-skills routes
app.use('/api/user-skills', authMiddleware, userSkillRoutes); // Apply middleware explicitly

// Mount mentors routes
app.use('/api/mentors', authMiddleware, mentorRoutes); // Apply middleware explicitly

// Mount notification routes
app.use('/api/notifications', authMiddleware, notificationRoutes); // Apply middleware explicitly

// Mount request routes
app.use('/api/requests', authMiddleware, requestRoutes); // Apply middleware explicitly

// Mount analytics routes
app.use('/api/analytics', analyticsRoutes); // Protection is handled inside analytics.js

// Mount direct update routes
app.use('/api/direct-update', authMiddleware, directUpdateRoutes); // Apply middleware explicitly

// Protected Routes (Apply authMiddleware BEFORE the route handler)
// Example: A route to get the current user's profile
app.get('/api/profile', authMiddleware, async (req, res) => {
    try {
        // authMiddleware has run, so req.user is available
        console.log(`Fetching profile for authenticated user: ${req.user.id}`);
        // Fetch user details from DB using req.user.id, excluding password
        const userProfile = await db.User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] } // Exclude sensitive data
            // include: [{ model: db.Department, as: 'department' }] // Optionally include associations
        });
        if (!userProfile) {
            // Should ideally not happen if token was valid for an existing user
            return res.status(404).json({ message: "User profile not found." });
        }
        res.json(userProfile);
    } catch(error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Error retrieving user profile." });
    }
});

// --- Test DB Connection & Start Server ---
async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database models with the database
    await db.sequelize.sync();
    console.log('Database synced successfully.');

    // Log all registered routes for debugging
    console.log('=== REGISTERED ROUTES ===');

    // First log direct routes
    console.log('Direct routes:');
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // Routes registered directly on the app
        console.log(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
      }
    });

    // Then log router middleware routes
    console.log('\nRouter middleware routes:');
    app._router.stack.forEach((middleware) => {
      if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const path = handler.route.path;
            const method = Object.keys(handler.route.methods).join(', ').toUpperCase();
            console.log(`${method} ${path}`);
          }
        });
      }
    });

    // Log specific routes we're interested in
    console.log('\nSpecific routes of interest:');
    console.log('GET /api/test-upcoming - Direct test endpoint');
    console.log('GET /api/tasks/test-upcoming - Task test endpoint');
    console.log('GET /api/tasks/my/upcoming - Upcoming deadlines endpoint');

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Exit if DB connection fails
  }
}

startServer();
