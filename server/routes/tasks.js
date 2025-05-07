// server/routes/tasks.js
const express = require('express');
const { Op } = require("sequelize"); // Import Sequelize operators for complex queries
const db = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// === Routes accessible by authenticated users ===

// GET /api/tasks/my - Get tasks assigned to the logged-in employee
router.get('/my', async (req, res) => {
    const userId = req.user.id;
    console.log(`[Tasks Route] Fetching tasks for user ID: ${userId}`);
    try {
        const tasks = await db.Task.findAll({
            where: { assignee_id: userId },
            include: [{ // Include supervisor details
                model: db.User,
                as: 'supervisor',
                attributes: ['id', 'full_name'] // Select specific fields
            }],
            order: [['due_date', 'ASC'], ['priority', 'DESC']] // Order by due date, then priority
        });
        res.json(tasks);
    } catch (error) {
        console.error('[Tasks Route] Error fetching assigned tasks:', error);
        res.status(500).json({ message: 'Failed to retrieve assigned tasks' });
    }
});

// GET /api/tasks/test-upcoming - Test endpoint for upcoming deadlines (NO AUTH REQUIRED)
router.get('/test-upcoming', async (req, res) => {
    console.log('[Tasks Route] /test-upcoming endpoint called - THIS IS A TEST ENDPOINT');
    res.json({ count: 0, message: 'Test endpoint working correctly' });
});

// GET /api/tasks/my/upcoming - Get count of upcoming deadlines for the logged-in employee
router.get('/my/upcoming', async (req, res) => {
    console.log('[Tasks Route] /my/upcoming endpoint called');
    console.log('[Tasks Route] Request headers:', req.headers);
    console.log('[Tasks Route] Auth token:', req.headers['x-auth-token']);

    // Check if user is authenticated
    if (!req.user) {
        console.error('[Tasks Route] User not authenticated');
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user.id;
    console.log(`[Tasks Route] Fetching upcoming deadlines count for user ID: ${userId}`);

    try {
        // Get current date and end of week
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
        const endOfWeek = new Date();
        endOfWeek.setDate(today.getDate() + 7);
        endOfWeek.setHours(23, 59, 59, 999); // Set to end of day for accurate comparison

        console.log(`[Tasks Route] Date range: ${today.toISOString()} to ${endOfWeek.toISOString()}`);

        // Count tasks with due dates in the next 7 days that are not completed
        const upcomingCount = await db.Task.count({
            where: {
                assignee_id: userId,
                status: { [Op.ne]: 'completed' }, // Not completed
                due_date: {
                    [Op.gte]: today,
                    [Op.lte]: endOfWeek
                }
            }
        });

        console.log(`[Tasks Route] Found ${upcomingCount} upcoming deadlines for user ${userId}`);

        // Always return 0 for testing
        const responseData = { count: 0 };
        console.log('[Tasks Route] Sending response:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('[Tasks Route] Error fetching upcoming deadlines count:', error);
        res.status(500).json({ message: 'Failed to retrieve upcoming deadlines count' });
    }
});

// PUT /api/tasks/:taskId/status - Update status of a task (Employee or Supervisor)
router.put('/:taskId/status', async (req, res) => {
    const taskId = req.params.taskId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { status } = req.body; // Expect 'pending', 'in-progress', or 'completed'

    // Validate status
    const allowedStatuses = ['pending', 'in-progress', 'completed'];
    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value provided.' });
    }

    console.log(`[Tasks Route] User ${userId} attempting to update task ${taskId} status to ${status}`);

    try {
        const task = await db.Task.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task not found.' });
        }

        // Authorization check: Allow assignee OR their supervisor OR a manager to update status
        let isAllowed = false;
        if (task.assignee_id === userId) { // Assignee can update
            isAllowed = true;
        } else if (task.supervisor_id === userId) { // Supervisor can update
             isAllowed = true;
        } else if (userRole === 'manager') { // Managers can update any
             isAllowed = true;
         }
         // Add more complex logic if needed (e.g., only supervisor can mark 'completed'?)

        if (!isAllowed) {
             console.log(`[Tasks Route] Forbidden: User ${userId} (role ${userRole}) not authorized to update task ${taskId}`);
            return res.status(403).json({ message: 'Forbidden: You are not authorized to update this task.' });
        }

        // Update the status
        task.status = status;

        // Set or clear completed_at timestamp based on status
        if (status === 'completed') {
            // Set completion timestamp when moving TO completed
            task.completed_at = new Date();
            console.log(`[Tasks Route] Setting completed_at for task ${taskId}`);
        } else if (task.completed_at) {
            // Clear completion timestamp if status changes FROM completed (e.g., reopen)
            task.completed_at = null;
            console.log(`[Tasks Route] Clearing completed_at for task ${taskId}`);
        }

        await task.save();

        console.log(`[Tasks Route] Task ${taskId} status updated to ${status} by user ${userId}`);

        // Return updated task with associations for better frontend display
        const updatedTask = await db.Task.findByPk(taskId, {
            include: [
                { model: db.User, as: 'assignee', attributes: ['id', 'full_name'] },
                { model: db.User, as: 'supervisor', attributes: ['id', 'full_name'] }
            ]
        });
        res.json(updatedTask);

    } catch (error) {
        console.error(`[Tasks Route] Error updating task ${taskId} status:`, error);
        res.status(500).json({ message: 'Failed to update task status.' });
    }
});


// === Routes accessible by Supervisor/Manager ===
const requireSupervisorOrManager = (req, res, next) => {
    if (req.user && (req.user.role === 'supervisor' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Access restricted to supervisors and managers.' });
    }
};

// POST /api/tasks - Create a new task (Supervisor/Manager only)
router.post('/', requireSupervisorOrManager, async (req, res) => {
    const supervisorId = req.user.id; // Logged-in supervisor/manager is the creator
    const { title, description, assignee_id, priority, due_date } = req.body;

    // Basic validation
    if (!title || !assignee_id) {
        return res.status(400).json({ message: 'Title and assignee ID are required.' });
    }
    // TODO: Add more validation (is assignee_id valid? is due_date format correct?)

    console.log(`[Tasks Route] User ${supervisorId} creating task for assignee ${assignee_id}`);

    try {
        const newTask = await db.Task.create({
            title,
            description,
            assignee_id,
            supervisor_id: supervisorId, // Creator is the logged-in supervisor/manager
            priority: priority || 'medium', // Default priority if not provided
            due_date: due_date || null, // Handle optional due date
            status: 'pending' // Default status
        });
        console.log(`[Tasks Route] Task created with ID: ${newTask.id}`);
        res.status(201).json(newTask); // Return created task with 201 status
    } catch (error) {
        // Handle potential foreign key constraint errors if assignee_id is invalid
        if (error.name === 'SequelizeForeignKeyConstraintError') {
             console.error('[Tasks Route] Error creating task: Invalid assignee ID.', error);
             return res.status(400).json({ message: 'Invalid assignee ID provided.' });
        }
        console.error('[Tasks Route] Error creating task:', error);
        res.status(500).json({ message: 'Failed to create task.' });
    }
});

// GET /api/tasks/team - Get tasks related to the supervisor's team
router.get('/team', requireSupervisorOrManager, async (req, res) => {
    const supervisorId = req.user.id;
    console.log(`[Tasks Route] Fetching team tasks for supervisor ID: ${supervisorId}`);
    try {
        // Get team members supervised by this supervisor
        const teamMemberIds = await db.User.findAll({
            where: { supervisor_id: supervisorId },
            attributes: ['id']
        }).then(users => users.map(u => u.id));

         const whereClause = {
             // Include tasks assigned to team members OR created by the supervisor directly
             [Op.or]: [
                { assignee_id: { [Op.in]: teamMemberIds } },
                { supervisor_id: supervisorId }
             ]
         };

        const tasks = await db.Task.findAll({
            where: whereClause,
            include: [ // Include details of assignee and supervisor
                { model: db.User, as: 'assignee', attributes: ['id', 'full_name'] },
                { model: db.User, as: 'supervisor', attributes: ['id', 'full_name'] }
            ],
             order: [['due_date', 'ASC'], ['priority', 'DESC']] // Order by due date, then priority
        });
        console.log(`[Tasks Route] Found ${tasks.length} team tasks for supervisor ${supervisorId}`);
        res.json(tasks);
    } catch (error) {
        console.error('[Tasks Route] Error fetching team tasks:', error);
        res.status(500).json({ message: 'Failed to retrieve team tasks.' });
    }
});

// GET /api/tasks/user/:userId - Get tasks for a specific user (Supervisor/Manager only)
router.get('/user/:userId', requireSupervisorOrManager, async (req, res) => {
    const { userId } = req.params;
    const supervisorId = req.user.id;

    console.log(`[Tasks Route] Supervisor ${supervisorId} fetching tasks for user ID: ${userId}`);

    try {
        // First verify this user is part of the supervisor's team
        const isTeamMember = await db.User.findOne({
            where: {
                id: userId,
                supervisor_id: supervisorId
            }
        });

        // If user is not found or not part of this supervisor's team
        if (!isTeamMember && req.user.role !== 'manager') {
            console.log(`[Tasks Route] User ${userId} is not part of supervisor ${supervisorId}'s team`);
            return res.status(403).json({
                message: 'Access denied: You can only view tasks for your team members'
            });
        }

        // Fetch the tasks for this user
        const tasks = await db.Task.findAll({
            where: { assignee_id: userId },
            include: [
                { model: db.User, as: 'assignee', attributes: ['id', 'full_name'] },
                { model: db.User, as: 'supervisor', attributes: ['id', 'full_name'] }
            ],
            order: [['due_date', 'ASC'], ['priority', 'DESC']]
        });

        console.log(`[Tasks Route] Found ${tasks.length} tasks for user ${userId}`);
        res.json(tasks);

    } catch (error) {
        console.error(`[Tasks Route] Error fetching tasks for user ${userId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve user tasks.' });
    }
});


// Log all registered routes for debugging
console.log('[Tasks Route] Registered routes:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`[Tasks Route] ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  }
});

module.exports = router;
