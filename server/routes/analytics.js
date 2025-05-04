// server/routes/analytics.js
const express = require('express');
const db = require('../models');
const { Task, User, Request, UserSkill, Skill } = db; // Import needed models
const { Op } = require('sequelize'); // Import Operators for date ranges
const sequelize = require('sequelize'); // Import sequelize for functions like COUNT, AVG
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware to ensure only Supervisor/Manager can access analytics
const requireSupervisorOrManager = (req, res, next) => {
    if (req.user && (req.user.role === 'supervisor' || req.user.role === 'manager')) {
        next();
    } else {
        console.log(`[Analytics Guard] Access denied. User role: ${req.user?.role}`);
        return res.status(403).json({ message: 'Forbidden: Access restricted to supervisors and managers' });
    }
};

// Apply auth middleware to all routes
router.use(authMiddleware);

// Custom middleware to check if user can access specific user's analytics
const canAccessUserAnalytics = (req, res, next) => {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    // Allow access if:
    // 1. User is requesting their own data
    // 2. User is a supervisor or manager
    if (userId === requestingUserId ||
        requestingUserRole === 'supervisor' ||
        requestingUserRole === 'manager') {
        next();
    } else {
        console.log(`[Analytics Guard] Access denied. User ${requestingUserId} (${requestingUserRole}) tried to access data for user ${userId}`);
        return res.status(403).json({ message: 'Forbidden: You can only access your own analytics data' });
    }
};

// GET /api/analytics/user/:userId/task-stats
router.get('/user/:userId/task-stats', canAccessUserAnalytics, async (req, res) => {
    const { userId } = req.params;
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    console.log(`[Analytics Route] Fetching task stats for user ${userId}, requested by ${requestingUserId}`);

    try {
        // Count total tasks assigned
        const totalTasks = await Task.count({
            where: { assignee_id: userId }
        });

        // Count completed tasks
        const completedTasks = await Task.count({
            where: {
                assignee_id: userId,
                status: 'completed'
            }
        });

        // Count tasks completed on time
        const onTimeTasks = await Task.count({
            where: {
                assignee_id: userId,
                status: 'completed',
                completed_at: { [Op.ne]: null }, // Ensure completed_at exists
                due_date: { [Op.ne]: null },     // Ensure due_date exists
                // Use sequelize.col to compare columns
                [Op.and]: [
                    sequelize.where(sequelize.fn('date', sequelize.col('completed_at')), '<=', sequelize.col('due_date'))
                    // Note: This compares DATE parts. Adjust if you need timestamp precision.
                ]
            }
        });

        // Calculate Rates (handle division by zero)
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        const successRate = completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0; // On-time rate of *completed* tasks

        // --- Prepare Response ---
        const stats = {
            userId: userId,
            totalTasksAssigned: totalTasks,
            tasksCompleted: completedTasks,
            tasksCompletedOnTime: onTimeTasks,
            taskCompletionRate: parseFloat(completionRate.toFixed(1)), // e.g., 85.7
            onTimeCompletionRate: parseFloat(successRate.toFixed(1))   // e.g., 92.3
        };

        // Log the results for debugging
        console.log(`[Analytics Route] Task stats for user ${userId}:`, {
            totalTasks,
            completedTasks,
            onTimeTasks,
            completionRate: stats.taskCompletionRate,
            onTimeRate: stats.onTimeCompletionRate
        });

        res.json(stats);

    } catch (error) {
        console.error(`[Analytics Route] Error fetching task stats for user ${userId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve task statistics.' });
    }
});

// GET /api/analytics/user/:userId/leave-overtime
router.get('/user/:userId/leave-overtime', canAccessUserAnalytics, async (req, res) => {
    const { userId } = req.params;
    // Date range query parameters (optional - add later if needed)
    // const { startDate, endDate } = req.query;
    console.log(`[Analytics Route] Fetching leave/overtime stats for user ${userId}`);

    try {
        // Define date range - use a wide range to ensure we capture data
        // Since our sample data might have future dates (2025), we'll use a range that includes those
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2026-01-01'); // Far future to include all test data

        // Count approved leave requests within range
        const approvedLeave = await Request.count({
            where: {
                user_id: userId,
                type: 'leave',
                status: 'approved',
                start_date: { [Op.between]: [startDate, endDate] } // Example date filter
            }
        });

        // Count approved overtime requests within range
        const approvedOvertime = await Request.count({
            where: {
                user_id: userId,
                type: 'overtime',
                status: 'approved',
                start_date: { [Op.between]: [startDate, endDate] } // Example date filter
            }
        });

        // Calculate total days of leave (sum of days between start_date and end_date)
        const leaveRequests = await Request.findAll({
            where: {
                user_id: userId,
                type: 'leave',
                status: 'approved',
                start_date: { [Op.between]: [startDate, endDate] }
            },
            attributes: ['start_date', 'end_date']
        });

        let totalLeaveDays = 0;
        for (const request of leaveRequests) {
            const start = new Date(request.start_date);
            const end = new Date(request.end_date);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            totalLeaveDays += diffDays;
        }

        // Calculate total overtime hours
        const overtimeRequests = await Request.findAll({
            where: {
                user_id: userId,
                type: 'overtime',
                status: 'approved',
                start_date: { [Op.between]: [startDate, endDate] }
            },
            attributes: ['hours']
        });

        let totalOvertimeHours = 0;
        for (const request of overtimeRequests) {
            totalOvertimeHours += request.hours || 0;
        }

        // Create stats object with default values
        const stats = {
            userId: userId,
            approvedLeaveRequests: approvedLeave,
            approvedOvertimeRequests: approvedOvertime,
            totalLeaveDays: totalLeaveDays,
            totalOvertimeHours: totalOvertimeHours
        };

        // Log the results for debugging
        console.log(`[Analytics Route] Leave/overtime stats for user ${userId}:`, {
            leaveRequests: approvedLeave,
            overtimeRequests: approvedOvertime,
            totalLeaveDays,
            totalOvertimeHours
        });

        res.json(stats);
    } catch (error) {
        console.error(`[Analytics Route] Error fetching leave/overtime stats for user ${userId}:`, error);
        res.status(500).json({ message: 'Failed to retrieve leave and overtime statistics.' });
    }
});

// GET /api/analytics/user/:userId/user-skills
router.get('/user/:userId/user-skills', canAccessUserAnalytics, async (req, res) => {
    try {
        const { userId } = req.params;

        // Find all user skills with associated skill details
        const userSkills = await db.UserSkill.findAll({
            where: { userId },
            include: [{
                model: db.Skill,
                as: 'skill',
                attributes: ['id', 'name', 'description']
            }],
            attributes: ['proficiencyLevel', 'canMentor', 'isCertified']
        });

        // Transform the data to be more frontend-friendly
        const transformedSkills = userSkills.map(userSkill => ({
            skillId: userSkill.skill.id,
            skillName: userSkill.skill.name,
            skillDescription: userSkill.skill.description,
            proficiencyLevel: userSkill.proficiencyLevel,
            canMentor: userSkill.canMentor,
            isCertified: userSkill.isCertified
        }));

        return res.json({
            userId,
            skills: transformedSkills
        });
    } catch (error) {
        console.error('Error fetching user skills:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/analytics/user/:userId/task-completion-rate
router.get('/user/:userId/task-completion-rate', canAccessUserAnalytics, async (req, res) => {
    try {
        const { userId } = req.params;

        // Count tasks by status
        const completed = await Task.count({
            where: { assignee_id: userId, status: 'completed' }
        });

        const inProgress = await Task.count({
            where: { assignee_id: userId, status: 'in-progress' }
        });

        const pending = await Task.count({
            where: { assignee_id: userId, status: 'pending' }
        });

        const totalTasks = completed + inProgress + pending;

        // Return the results
        return res.json({
            userId,
            totalTasks,
            completed,
            inProgress,
            pending,
            tasksByStatus: {
                completed,
                'in-progress': inProgress,
                pending
            }
        });
    } catch (error) {
        console.error('Error fetching task completion rate:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/analytics/team/task-stats
router.get('/team/task-stats', requireSupervisorOrManager, async (req, res) => {
    const supervisorId = req.user.id;
    console.log(`[Analytics Route] Fetching team task stats for supervisor ${supervisorId}`);

    try {
        // Get all team members (users where supervisor_id = current user's id)
        const teamMembers = await User.findAll({
            where: { supervisor_id: supervisorId },
            attributes: ['id', 'full_name']
        });

        if (!teamMembers || teamMembers.length === 0) {
            return res.status(404).json({ message: 'No team members found for this supervisor.' });
        }

        const teamMemberIds = teamMembers.map(member => member.id);

        // Get aggregated team stats
        const teamStats = {
            totalTeamMembers: teamMembers.length,
            totalTasks: 0,
            completedTasks: 0,
            onTimeTasks: 0,
            memberStats: []
        };

        // Get individual stats for each team member
        for (const member of teamMembers) {
            // Count total tasks assigned
            const totalTasks = await Task.count({
                where: { assignee_id: member.id }
            });

            // Count completed tasks
            const completedTasks = await Task.count({
                where: {
                    assignee_id: member.id,
                    status: 'completed'
                }
            });

            // Count tasks completed on time
            const onTimeTasks = await Task.count({
                where: {
                    assignee_id: member.id,
                    status: 'completed',
                    completed_at: { [Op.ne]: null },
                    due_date: { [Op.ne]: null },
                    [Op.and]: [
                        sequelize.where(sequelize.fn('date', sequelize.col('completed_at')), '<=', sequelize.col('due_date'))
                    ]
                }
            });

            // Calculate rates
            const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            const onTimeRate = completedTasks > 0 ? (onTimeTasks / completedTasks) * 100 : 0;

            // Add to team totals
            teamStats.totalTasks += totalTasks;
            teamStats.completedTasks += completedTasks;
            teamStats.onTimeTasks += onTimeTasks;

            // Add individual stats
            teamStats.memberStats.push({
                userId: member.id,
                fullName: member.full_name,
                totalTasks,
                completedTasks,
                onTimeTasks,
                completionRate: parseFloat(completionRate.toFixed(1)),
                onTimeRate: parseFloat(onTimeRate.toFixed(1))
            });
        }

        // Calculate team averages
        teamStats.teamCompletionRate = teamStats.totalTasks > 0
            ? parseFloat(((teamStats.completedTasks / teamStats.totalTasks) * 100).toFixed(1))
            : 0;

        teamStats.teamOnTimeRate = teamStats.completedTasks > 0
            ? parseFloat(((teamStats.onTimeTasks / teamStats.completedTasks) * 100).toFixed(1))
            : 0;

        res.json(teamStats);

    } catch (error) {
        console.error(`[Analytics Route] Error fetching team task stats:`, error);
        res.status(500).json({ message: 'Failed to retrieve team task statistics.' });
    }
});

// GET /api/analytics/team/:supervisorId/stats
router.get('/team/:supervisorId/stats', async (req, res) => {
    try {
        const { supervisorId } = req.params;
        console.log("Fetching team stats for supervisor:", supervisorId);
        
        // 1. Get all team members for this supervisor
        const teamMembers = await db.User.findAll({
            where: { supervisor_id: supervisorId },
            attributes: ['id', 'full_name', 'email', 'role', 'job_title']
        });
        
        console.log(`Found ${teamMembers ? teamMembers.length : 0} team members`);
        
        if (!teamMembers || teamMembers.length === 0) {
            return res.json({
                supervisorId,
                totalTeamMembers: 0,
                avgCompletionRate: 0,
                avgOnTimeRate: 0,
                memberStats: []
            });
        }
        
        // 2. Collect analytics for each team member
        const memberStats = await Promise.all(
            teamMembers.map(async (member) => {
                // Get task stats
                const totalTasks = await db.Task.count({
                    where: { assignee_id: member.id }
                });
                
                const completedTasks = await db.Task.count({
                    where: { 
                        assignee_id: member.id,
                        status: 'completed'
                    }
                });
                
                const completedOnTimeTasks = await db.Task.count({
                    where: { 
                        assignee_id: member.id,
                        status: 'completed',
                        completed_at: {
                            [db.Sequelize.Op.lte]: db.Sequelize.col('due_date')
                        }
                    }
                });
                
                // Get leave stats
                const approvedLeaveRequests = await db.Request.count({
                    where: {
                        user_id: member.id,
                        type: 'leave',
                        status: 'approved'
                    }
                });
                
                const totalLeaveDays = await db.Request.sum('days', {
                    where: {
                        user_id: member.id,
                        type: 'leave',
                        status: 'approved'
                    }
                }) || 0;
                
                // Get overtime stats
                const approvedOvertimeRequests = await db.Request.count({
                    where: {
                        user_id: member.id,
                        type: 'overtime',
                        status: 'approved'
                    }
                });
                
                const totalOvertimeHours = await db.Request.sum('hours', {
                    where: {
                        user_id: member.id,
                        type: 'overtime',
                        status: 'approved'
                    }
                }) || 0;
                
                // Get user skill count
                const skillCount = await db.UserSkill.count({
                    where: { userId: member.id }
                });
                
                // Calculate rates
                const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                const onTimeRate = completedTasks > 0 ? (completedOnTimeTasks / completedTasks) * 100 : 0;
                
                return {
                    userId: member.id,
                    userName: member.full_name,
                    email: member.email,
                    role: member.role,
                    jobTitle: member.job_title,
                    totalTasks,
                    completedTasks,
                    completedOnTimeTasks,
                    completionRate: Math.round(completionRate),
                    onTimeRate: Math.round(onTimeRate),
                    approvedLeaveRequests,
                    totalLeaveDays,
                    approvedOvertimeRequests,
                    totalOvertimeHours,
                    skillCount
                };
            })
        );
        
        // 3. Calculate team averages
        const totalMembers = memberStats.length;
        const sumCompletionRate = memberStats.reduce((sum, member) => sum + member.completionRate, 0);
        const sumOnTimeRate = memberStats.reduce((sum, member) => sum + member.onTimeRate, 0);
        
        const avgCompletionRate = totalMembers > 0 ? Math.round(sumCompletionRate / totalMembers) : 0;
        const avgOnTimeRate = totalMembers > 0 ? Math.round(sumOnTimeRate / totalMembers) : 0;
        
        // 4. Return the complete team stats
        const result = {
            supervisorId,
            totalTeamMembers: totalMembers,
            avgCompletionRate,
            avgOnTimeRate,
            memberStats
        };
        
        console.log("Returning team stats:", JSON.stringify(result, null, 2));
        return res.json(result);
        
    } catch (error) {
        console.error('Error fetching team stats:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
