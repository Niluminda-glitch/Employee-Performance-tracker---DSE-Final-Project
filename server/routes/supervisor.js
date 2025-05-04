// server/routes/supervisor.js
const express = require('express');
const db = require('../models'); // Import models
const authMiddleware = require('../middleware/authMiddleware'); // Import auth middleware

const router = express.Router();

// GET /api/supervisor/team - Get the logged-in supervisor's team members
router.get('/team', authMiddleware, async (req, res) => {
    // Ensure only supervisors or managers can access this
    if (req.user.role !== 'supervisor' && req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Forbidden: Access restricted to supervisors and managers' });
    }

    const supervisorId = req.user.id; // Get supervisor's ID from authenticated user token
    console.log(`[Supervisor Route] Fetching team for supervisor ID: ${supervisorId}`);

    try {
        const teamMembers = await db.User.findAll({
            where: {
                supervisor_id: supervisorId // Find users whose supervisor_id matches the logged-in user
            },
            attributes: { // Select only necessary fields, exclude sensitive data
                exclude: ['password', 'google_id', 'createdAt', 'updatedAt']
            },
            include: [
                {
                    model: db.Department,
                    as: 'userDepartment',
                    attributes: ['id', 'name']
                }
            ],
            order: [['full_name', 'ASC']] // Order alphabetically by name
        });

        console.log(`[Supervisor Route] Found ${teamMembers.length} team members.`);
        res.json(teamMembers);

    } catch (error) {
        console.error('[Supervisor Route] Error fetching team:', error);
        res.status(500).json({ message: 'Failed to retrieve team members' });
    }
});

// Add other supervisor-specific routes here later...

module.exports = router;
