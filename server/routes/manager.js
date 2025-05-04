// server/routes/manager.js
const express = require('express');
const db = require('../models'); // Import models
const authMiddleware = require('../middleware/authMiddleware'); // Need auth middleware
const { Op } = require('sequelize'); // Import Op for validation
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

const router = express.Router();

// Middleware specific to this router to check if user is a manager
const requireManager = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        next(); // Allow access if user is a manager
    } else {
        console.log(`[Manager Route Guard] Access denied. User role: ${req.user?.role}`);
        res.status(403).json({ message: 'Forbidden: Access restricted to managers' }); // 403 Forbidden
    }
};

// GET /api/manager/users - Get a list of all users
// Applies authMiddleware first, then requireManager
router.get('/users', authMiddleware, requireManager, async (req, res) => {
    console.log(`[Manager Route] Fetching all users requested by manager ID: ${req.user.id}`);

    // Check if a specific role is requested
    const { role } = req.query;
    let whereClause = {};

    if (role) {
        console.log(`[Manager Route] Filtering users by role: ${role}`);
        whereClause.role = role;
    }

    try {
        const allUsers = await db.User.findAll({
            where: whereClause,
            attributes: { // Exclude sensitive data
                exclude: ['password', 'google_id', 'updatedAt'] // Exclude password hash, google id etc.
            },
            include: [ // Optionally include associated data for display
                {
                    model: db.Department,
                    as: 'userDepartment',
                    attributes: ['id', 'name'] // Only get department name
                },
                {
                   model: db.User, // Self reference using the alias we defined in user model
                   as: 'supervisor',
                   attributes: ['id', 'full_name'] // Only get supervisor name
                }
            ],
            order: [['full_name', 'ASC']] // Order alphabetically
        });

        console.log(`[Manager Route] Found ${allUsers.length} users.`);
        res.json(allUsers);

    } catch (error) {
        console.error('[Manager Route] Error fetching all users:', error);
        res.status(500).json({ message: 'Failed to retrieve user list' });
    }
});

// PUT /api/manager/users/:userId - Update a specific user's profile
router.put('/users/:userId', authMiddleware, requireManager, async (req, res) => {
    const managerId = req.user.id; // ID of the manager performing the action
    const userIdToUpdate = req.params.userId; // ID of the user being updated (from URL parameter)
    const {
        full_name,
        email, // Be cautious allowing email changes if it's linked to auth
        job_title,
        role,
        status,
        department_id, // Expecting UUID or null
        supervisor_id  // Expecting UUID or null
        // Add other updatable fields from your users table as needed
    } = req.body; // Get updated data from request body

    console.log(`[Manager Route] Manager ${managerId} attempting to update user ${userIdToUpdate}`);

    // --- Basic Input Validation ---
    if (!userIdToUpdate) {
        return res.status(400).json({ message: "User ID parameter is missing." });
    }

    // Prevent manager from accidentally editing themselves via this route? (Optional)
    // if (managerId === userIdToUpdate) {
    //     return res.status(403).json({ message: "Cannot edit your own profile via this administrative route." });
    // }

    // Validate role and status against ENUMs if provided
    const allowedRoles = ['employee', 'supervisor', 'manager'];
    const allowedStatuses = ['active', 'inactive', 'first_login'];

    if (role && !allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role specified. Allowed roles: ${allowedRoles.join(', ')}` });
    }

    if (status && !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status specified. Allowed statuses: ${allowedStatuses.join(', ')}` });
    }

    try {
        // Find the user to update
        const userToUpdate = await db.User.findByPk(userIdToUpdate);

        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found." });
        }

        // --- Update Fields ---
        // Only update fields that are provided in the request body
        if (full_name !== undefined) userToUpdate.full_name = full_name;

        if (email !== undefined && email !== userToUpdate.email) {
             // CAUTION: Changing email might break auth if not handled carefully
             // For now, let's allow it but log a warning. A better approach might
             // involve coordinating with the auth system (if separate) or disallowing it here.
             console.warn(`[Manager Route] Manager ${managerId} is changing email for user ${userIdToUpdate} from ${userToUpdate.email} to ${email}. Ensure auth consistency.`);
             userToUpdate.email = email;
        }

        if (job_title !== undefined) userToUpdate.job_title = job_title;
        if (role !== undefined) userToUpdate.role = role;
        if (status !== undefined) userToUpdate.status = status;

        // Handle setting FKs to null explicitly if an empty string or null is passed
        if (department_id !== undefined) userToUpdate.department_id = department_id || null;
        if (supervisor_id !== undefined) userToUpdate.supervisor_id = supervisor_id || null;

        // Save the changes
        await userToUpdate.save();

        console.log(`[Manager Route] User ${userIdToUpdate} profile updated successfully by manager ${managerId}`);

        // Return the updated user profile (excluding password)
        const updatedProfile = await db.User.findByPk(userIdToUpdate, {
             attributes: { exclude: ['password', 'google_id'] },
             include: [
                {
                    model: db.Department,
                    as: 'userDepartment',
                    attributes: ['id', 'name']
                },
                {
                   model: db.User,
                   as: 'supervisor',
                   attributes: ['id', 'full_name']
                }
            ]
        });

        res.json(updatedProfile);

    } catch (error) {
         // Handle potential unique constraint errors (e.g., if changing email to one that already exists)
         if (error.name === 'SequelizeUniqueConstraintError') {
             console.error('[Manager Route] Update failed due to unique constraint:', error);
             return res.status(409).json({ message: 'Update failed. Email might already be in use.', fields: error.fields });
         }
        console.error(`[Manager Route] Error updating user ${userIdToUpdate}:`, error);
        res.status(500).json({ message: 'Failed to update user profile.' });
    }
});

// PUT /api/manager/users/:userId/deactivate - Deactivate a user
router.put('/users/:userId/deactivate', authMiddleware, requireManager, async (req, res) => {
    const managerId = req.user.id;
    const userIdToDeactivate = req.params.userId;

    console.log(`[Manager Route] Manager ${managerId} attempting to deactivate user ${userIdToDeactivate}`);

    if (!userIdToDeactivate) {
        return res.status(400).json({ message: "User ID parameter is missing." });
    }

    // Prevent manager from deactivating themselves
    if (managerId === userIdToDeactivate) {
        return res.status(403).json({ message: "You cannot deactivate your own account." });
    }

    try {
        const userToDeactivate = await db.User.findByPk(userIdToDeactivate);

        if (!userToDeactivate) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already inactive
        if (userToDeactivate.status === 'inactive') {
            return res.status(400).json({ message: 'User is already inactive.' });
        }

        // Update status to inactive
        userToDeactivate.status = 'inactive';
        await userToDeactivate.save();

        console.log(`[Manager Route] User ${userIdToDeactivate} deactivated successfully by manager ${managerId}`);

        // Return the updated user profile (excluding password)
        const updatedProfile = await db.User.findByPk(userIdToDeactivate, {
             attributes: { exclude: ['password', 'google_id'] },
             include: [
                {
                    model: db.Department,
                    as: 'userDepartment',
                    attributes: ['id', 'name']
                },
                {
                   model: db.User,
                   as: 'supervisor',
                   attributes: ['id', 'full_name']
                }
            ]
        });
        res.json(updatedProfile); // Send back updated user

    } catch (error) {
        console.error(`[Manager Route] Error deactivating user ${userIdToDeactivate}:`, error);
        res.status(500).json({ message: 'Failed to deactivate user.' });
    }
});

// PUT /api/manager/users/:userId/reactivate - Reactivate a user
router.put('/users/:userId/reactivate', authMiddleware, requireManager, async (req, res) => {
    const managerId = req.user.id;
    const userIdToReactivate = req.params.userId;

    console.log(`[Manager Route] Manager ${managerId} attempting to reactivate user ${userIdToReactivate}`);

    if (!userIdToReactivate) {
        return res.status(400).json({ message: "User ID parameter is missing." });
    }

    try {
        const userToReactivate = await db.User.findByPk(userIdToReactivate);

        if (!userToReactivate) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if already active
        if (userToReactivate.status === 'active') {
            return res.status(400).json({ message: 'User is already active.' });
        }

        // Update status to active
        userToReactivate.status = 'active';
        await userToReactivate.save();

        console.log(`[Manager Route] User ${userIdToReactivate} reactivated successfully by manager ${managerId}`);

        // Return the updated user profile (excluding password)
        const updatedProfile = await db.User.findByPk(userIdToReactivate, {
             attributes: { exclude: ['password', 'google_id'] },
             include: [
                {
                    model: db.Department,
                    as: 'userDepartment',
                    attributes: ['id', 'name']
                },
                {
                   model: db.User,
                   as: 'supervisor',
                   attributes: ['id', 'full_name']
                }
            ]
        });
        res.json(updatedProfile); // Send back updated user

    } catch (error) {
        console.error(`[Manager Route] Error reactivating user ${userIdToReactivate}:`, error);
        res.status(500).json({ message: 'Failed to reactivate user.' });
    }
});

// --- NEW: POST /api/manager/users - Create a new user ---
router.post('/users', authMiddleware, requireManager, async (req, res) => {
    const {
        full_name,
        email,
        job_title,
        role,
        status = 'first_login', // Default to 'first_login'
        department_id,
        supervisor_id,
        skill_id // New field for skill
    } = req.body;

    console.log(`[Manager Route] Attempting to create new user:`, { email, role, status, skill_id });

    // --- Basic Validation ---
    if (!full_name || !email || !role) {
        return res.status(400).json({ message: "Full name, email, and role are required." });
    }

    // Validate role and status against allowed ENUMs
    const allowedRoles = ['employee', 'supervisor', 'manager'];
    const allowedStatuses = ['active', 'inactive', 'first_login'];
    if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: `Invalid role specified. Allowed roles: ${allowedRoles.join(', ')}` });
    }
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status specified. Allowed statuses: ${allowedStatuses.join(', ')}` });
    }

    try {
        // Check if email already exists
        const existingUser = await db.User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email address is already in use." });
        }

        // Validate department_id if provided
        if (department_id) {
            const deptExists = await db.Department.findByPk(department_id);
            if (!deptExists) {
                return res.status(400).json({ message: "Invalid Department ID provided." });
            }
        }

        // Validate supervisor_id if provided
        if (supervisor_id) {
            const supExists = await db.User.findByPk(supervisor_id);
            if (!supExists) {
                return res.status(400).json({ message: "Invalid Supervisor ID provided." });
            }
        }

        // Validate skill_id if provided
        let skillExists = null;
        if (skill_id) {
            try {
                console.log(`[Manager Route] Validating skill_id: ${skill_id}`);

                // Check if the Skill model is properly defined
                if (!db.Skill) {
                    console.error('[Manager Route] Skill model is not defined!');
                    return res.status(500).json({ message: "Server configuration error: Skill model not found." });
                }

                // Log the structure of the model
                console.log('[Manager Route] Skill model attributes:',
                    Object.keys(db.Skill.rawAttributes).join(', '));

                // Try to find the skill
                skillExists = await db.Skill.findByPk(skill_id);

                if (!skillExists) {
                    console.error(`[Manager Route] Skill with ID ${skill_id} not found in database`);
                    return res.status(400).json({ message: "Invalid Skill ID provided." });
                }

                console.log(`[Manager Route] Found skill: ${skillExists.name}`);
            } catch (skillError) {
                console.error('[Manager Route] Error validating skill:', skillError);
                console.error('[Manager Route] Error stack:', skillError.stack);
                return res.status(500).json({
                    message: "Error validating skill ID.",
                    error: skillError.message
                });
            }
        }

        // --- Password Handling ---
        // Generate a random temporary password (8 characters)
        const temporaryPassword = Math.random().toString(36).slice(-8);
        console.log(`[Manager Route] Generated temporary password for new user: ${temporaryPassword}`);

        // No need to hash the password here - the User model hooks will do it automatically

        // --- Create User ---
        console.log('[Manager Route] Creating new user with data:', {
            full_name,
            email,
            role,
            job_title: job_title || null,
            status,
            department_id: department_id || null,
            supervisor_id: supervisor_id || null
        });

        let newUser;
        try {
            newUser = await db.User.create({
                full_name,
                email,
                password: temporaryPassword, // Model hooks will hash this
                job_title: job_title || null,
                role,
                status, // Use the provided or defaulted status ('first_login')
                department_id: department_id || null, // Handle optional FKs
                supervisor_id: supervisor_id || null, // Handle optional FKs
                // Sequelize handles id (UUID) and timestamps automatically
            });

            console.log(`[Manager Route] User created successfully with ID: ${newUser.id}`);
        } catch (userCreateError) {
            console.error('[Manager Route] Error creating user:', userCreateError);
            console.error('[Manager Route] Error stack:', userCreateError.stack);
            throw userCreateError; // Re-throw to be caught by the outer catch block
        }

        console.log(`[Manager Route] User ${newUser.id} created successfully.`);

        // If a skill was provided, create a user_skill record
        if (skill_id && skillExists) {
            try {
                console.log(`[Manager Route] Creating user-skill record for user ${newUser.id} and skill ${skill_id}`);

                // Check if the UserSkill model is properly defined
                if (!db.UserSkill) {
                    console.error('[Manager Route] UserSkill model is not defined!');
                    throw new Error('UserSkill model is not defined');
                }

                // Log the structure of the model
                console.log('[Manager Route] UserSkill model attributes:',
                    Object.keys(db.UserSkill.rawAttributes).join(', '));

                // Try to find the skill first to verify it exists
                const skillCheck = await db.Skill.findByPk(skill_id);
                if (!skillCheck) {
                    console.error(`[Manager Route] Skill with ID ${skill_id} not found in database`);
                    throw new Error(`Skill with ID ${skill_id} not found`);
                }
                console.log(`[Manager Route] Verified skill exists: ${skillCheck.name}`);

                try {
                    // Try to create the user-skill record with the model first
                    const userSkill = await db.UserSkill.create({
                        userId: newUser.id,
                        skillId: skill_id,
                        proficiencyLevel: 'beginner',
                        canMentor: false,
                        isCertified: false
                    });

                    console.log(`[Manager Route] Added skill ${skillExists.name} to user ${newUser.id} using model`);
                } catch (modelError) {
                    console.error('[Manager Route] Error creating user-skill with model:', modelError);

                    // If model approach fails, try direct SQL as a fallback
                    try {
                        console.log('[Manager Route] Trying direct SQL query as fallback');

                        // Use a raw SQL query to insert the record
                        await db.sequelize.query(`
                            INSERT INTO user_skills (user_id, skill_id, proficiency_level, willing_to_mentor, is_certified, "createdAt", "updatedAt")
                            VALUES (:userId, :skillId, 'beginner', false, false, NOW(), NOW())
                        `, {
                            replacements: {
                                userId: newUser.id,
                                skillId: skill_id
                            },
                            type: db.sequelize.QueryTypes.INSERT
                        });

                        console.log(`[Manager Route] Added skill ${skillExists.name} to user ${newUser.id} using SQL`);
                    } catch (sqlError) {
                        console.error('[Manager Route] Error creating user-skill with SQL:', sqlError);
                        throw sqlError; // Re-throw to be caught by the outer catch
                    }
                }
            } catch (skillError) {
                console.error('[Manager Route] Error adding skill to user:', skillError);
                console.error('[Manager Route] Error stack:', skillError.stack);
                // We don't want to fail the whole request if just the skill association fails
                // So we log the error but continue
            }
        } else {
            console.log(`[Manager Route] No skill provided or skill not found. skill_id: ${skill_id}, skillExists: ${skillExists ? 'true' : 'false'}`);
        }

        // Return the newly created user profile (excluding password hash)
        const newUserProfile = await db.User.findByPk(newUser.id, {
            attributes: { exclude: ['password', 'google_id'] },
            include: [
                { model: db.Department, as: 'userDepartment', attributes: ['id', 'name'] },
                { model: db.User, as: 'supervisor', attributes: ['id', 'full_name'] }
            ]
        });

        // Add the temporary password to the response (but not to the database record)
        const responseData = {
            ...newUserProfile.toJSON(),
            temporaryPassword: temporaryPassword // Include the unhashed temporary password
        };

        res.status(201).json(responseData); // 201 Created status

    } catch (error) {
        // Handle potential unique constraint errors (just in case findOne check fails under race conditions)
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('[Manager Route] Error creating user due to unique constraint:', error);
            return res.status(409).json({ message: 'User creation failed. Email might already be in use.', fields: error.fields });
        }

        // Handle validation errors
        if (error.name === 'SequelizeValidationError') {
            console.error('[Manager Route] Validation error creating user:', error);
            return res.status(400).json({
                message: 'User creation failed due to validation errors.',
                errors: error.errors.map(e => ({ field: e.path, message: e.message }))
            });
        }

        // Log the full error for debugging
        console.error('[Manager Route] Error creating user:', error);
        console.error('[Manager Route] Error stack:', error.stack);

        // Return a more detailed error message
        res.status(500).json({
            message: 'Failed to create user profile.',
            error: error.message,
            name: error.name
        });
    }
});

module.exports = router;
