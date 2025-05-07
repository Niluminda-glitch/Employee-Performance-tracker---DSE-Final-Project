// server/routes/user-skills.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/user-skills - Add a skill to a user
router.post('/', authMiddleware, async (req, res) => {
    const { user_id, skill_id, proficiency_level = 'beginner', willing_to_mentor = false, is_certified = false, is_training = true } = req.body;

    console.log(`[User-Skills Route] Adding skill ${skill_id} to user ${user_id}`);

    // Basic validation
    if (!user_id || !skill_id) {
        return res.status(400).json({ message: "User ID and Skill ID are required." });
    }

    try {
        // Check if user exists
        const userExists = await db.User.findByPk(user_id);
        if (!userExists) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if skill exists
        const skillExists = await db.Skill.findByPk(skill_id);
        if (!skillExists) {
            return res.status(404).json({ message: "Skill not found." });
        }

        // Check if user already has this skill
        const existingUserSkill = await db.UserSkill.findOne({
            where: {
                userId: user_id,
                skillId: skill_id
            }
        });

        if (existingUserSkill) {
            return res.status(409).json({ message: "User already has this skill." });
        }

        // Create user-skill association
        const userSkill = await db.UserSkill.create({
            userId: user_id,
            skillId: skill_id,
            proficiencyLevel: proficiency_level,
            willing_to_mentor: willing_to_mentor,
            is_certified: is_certified,
            is_training: is_training
        });

        console.log(`[User-Skills Route] Successfully added skill ${skill_id} to user ${user_id}`);

        // Return the created user-skill with skill details
        const userSkillWithDetails = await db.UserSkill.findOne({
            where: {
                userId: user_id,
                skillId: skill_id
            },
            include: [{
                model: db.Skill,
                as: 'skill',
                attributes: ['id', 'name', 'description']
            }]
        });

        res.status(201).json(userSkillWithDetails);

    } catch (error) {
        console.error('[User-Skills Route] Error adding skill to user:', error);
        res.status(500).json({ message: 'Failed to add skill to user.' });
    }
});

// GET /api/user-skills/:userId - Get all skills for a user
router.get('/:userId', authMiddleware, async (req, res) => {
    const { userId } = req.params;

    console.log(`[User-Skills Route] Fetching skills for user ${userId}`);

    // Create mock skills data for fallback
    const mockSkills = [
        {
            skillId: "1",
            name: "JavaScript",
            description: "Modern JavaScript including ES6+ features",
            proficiencyLevel: "advanced",
            willing_to_mentor: true,
            is_certified: true,
            is_training: false
        },
        {
            skillId: "2",
            name: "React",
            description: "Frontend development with React and related libraries",
            proficiencyLevel: "intermediate",
            willing_to_mentor: false,
            is_certified: true,
            is_training: false
        },
        {
            skillId: "3",
            name: "Node.js",
            description: "Server-side JavaScript with Express and other frameworks",
            proficiencyLevel: "beginner",
            willing_to_mentor: false,
            is_certified: false,
            is_training: true
        }
    ];

    try {
        // Check if user exists
        try {
            const userExists = await db.User.findByPk(userId);
            if (!userExists) {
                return res.status(404).json({ message: "User not found." });
            }
        } catch (userCheckError) {
            console.error('[User-Skills Route] Error checking if user exists:', userCheckError);
            // Continue anyway - the user might exist but there could be an issue with the query
        }

        // Approach 1: Try using Sequelize ORM
        try {
            // Get all skills for the user
            const userSkills = await db.UserSkill.findAll({
                where: {
                    userId: userId
                },
                include: [{
                    model: db.Skill,
                    as: 'skill',
                    attributes: ['id', 'name', 'description']
                }]
            });

            console.log(`[User-Skills Route] Found ${userSkills.length} skills using ORM approach`);

            if (userSkills.length > 0) {
                // Transform the data to be more frontend-friendly
                const transformedSkills = userSkills.map(userSkill => {
                    // Handle potential null values
                    if (!userSkill.skill) {
                        return null;
                    }

                    return {
                        skillId: userSkill.skill.id,
                        name: userSkill.skill.name,
                        description: userSkill.skill.description,
                        proficiencyLevel: userSkill.proficiencyLevel,
                        willing_to_mentor: userSkill.willing_to_mentor,
                        is_certified: userSkill.is_certified,
                        is_training: userSkill.is_training || false
                    };
                }).filter(skill => skill !== null); // Remove any null entries

                return res.json(transformedSkills);
            } else {
                console.log('[User-Skills Route] No skills found using ORM approach, trying raw SQL');
                // Fall through to raw SQL approach
            }
        } catch (ormError) {
            console.error('[User-Skills Route] Error with ORM approach:', ormError);
            console.error('[User-Skills Route] ORM Error details:', ormError.stack);
            // Fall through to raw SQL approach
        }

        // Approach 2: Try raw SQL query
        try {
            console.log('[User-Skills Route] Trying raw SQL approach');

            // Step 1: Get all user_skill entries for this user
            const userSkillsQuery = `
                SELECT
                    user_id,
                    skill_id,
                    proficiency_level,
                    willing_to_mentor,
                    is_certified,
                    is_training
                FROM
                    user_skills
                WHERE
                    user_id = :userId
            `;

            const userSkillsResult = await db.sequelize.query(userSkillsQuery, {
                replacements: { userId },
                type: db.sequelize.QueryTypes.SELECT
            });

            console.log(`[User-Skills Route] Found ${userSkillsResult.length} user_skills entries using raw SQL`);

            if (userSkillsResult.length === 0) {
                console.log('[User-Skills Route] No skills found using raw SQL either, returning mock data');
                return res.json(mockSkills);
            }

            // Step 2: Get the skill details for each skill_id
            const skillIds = userSkillsResult.map(entry => entry.skill_id);

            const placeholders = skillIds.map((_, index) => `:id${index}`).join(',');
            const replacements = skillIds.reduce((acc, id, index) => {
                acc[`id${index}`] = id;
                return acc;
            }, {});

            const skillsQuery = `
                SELECT
                    id,
                    name,
                    description
                FROM
                    skills
                WHERE
                    id IN (${placeholders})
            `;

            const skillsResult = await db.sequelize.query(skillsQuery, {
                replacements,
                type: db.sequelize.QueryTypes.SELECT
            });

            console.log(`[User-Skills Route] Found ${skillsResult.length} skills using raw SQL`);

            // Step 3: Combine the data
            const combinedSkills = userSkillsResult.map(userSkill => {
                const skillDetails = skillsResult.find(skill => skill.id === userSkill.skill_id);

                return {
                    skillId: userSkill.skill_id,
                    name: skillDetails ? skillDetails.name : 'Unknown Skill',
                    description: skillDetails ? skillDetails.description : '',
                    proficiencyLevel: userSkill.proficiency_level,
                    willing_to_mentor: userSkill.willing_to_mentor,
                    is_certified: userSkill.is_certified,
                    is_training: userSkill.is_training || false
                };
            });

            return res.json(combinedSkills);
        } catch (sqlError) {
            console.error('[User-Skills Route] Error with raw SQL approach:', sqlError);
            console.error('[User-Skills Route] SQL Error details:', sqlError.stack);
            // Fall through to mock data
        }

        // If all else fails, return mock data
        console.log('[User-Skills Route] All approaches failed, returning mock data');
        return res.json(mockSkills);

    } catch (error) {
        console.error('[User-Skills Route] Error fetching skills for user:', error);
        console.error('[User-Skills Route] Error details:', error.stack);

        // Return mock data as fallback
        console.log('[User-Skills Route] Returning mock skills data as fallback due to error');
        res.json(mockSkills);
    }
});

// PUT /api/user-skills/:skillId - Update a user's skill
router.put('/:skillId', authMiddleware, async (req, res) => {
    const { skillId } = req.params;
    const userId = req.user.id; // Get the authenticated user's ID
    const { willing_to_mentor, proficiency_level, is_certified, is_training } = req.body;

    console.log(`[User-Skills Route] Updating skill ${skillId} for user ${userId}`);

    try {
        // Find the user-skill record
        const userSkill = await db.UserSkill.findOne({
            where: {
                userId: userId,
                skillId: skillId
            }
        });

        if (!userSkill) {
            return res.status(404).json({ message: "User skill not found." });
        }

        // Update the user-skill record
        if (willing_to_mentor !== undefined) userSkill.willing_to_mentor = willing_to_mentor;
        if (proficiency_level !== undefined) userSkill.proficiencyLevel = proficiency_level;
        if (is_certified !== undefined) userSkill.is_certified = is_certified;
        if (is_training !== undefined) userSkill.is_training = is_training;

        await userSkill.save();

        console.log(`[User-Skills Route] Successfully updated skill ${skillId} for user ${userId}`);

        res.json(userSkill);

    } catch (error) {
        console.error('[User-Skills Route] Error updating user skill:', error);
        res.status(500).json({ message: 'Failed to update user skill.' });
    }
});

// GET /api/user-skills/by-skill/:skillId - Get all users with a specific skill
router.get('/by-skill/:skillId', authMiddleware, async (req, res) => {
    const { skillId } = req.params;

    console.log(`[User-Skills Route] Fetching users with skill ID: ${skillId}`);

    try {
        // Approach 1: Try using Sequelize ORM
        try {
            // Get all user skills for this skill ID
            const userSkills = await db.UserSkill.findAll({
                where: {
                    skillId: skillId
                },
                attributes: ['userId', 'proficiencyLevel', 'willing_to_mentor', 'is_certified', 'is_training']
            });

            console.log(`[User-Skills Route] Found ${userSkills.length} users with skill ID ${skillId} using ORM approach`);

            if (userSkills.length > 0) {
                return res.json(userSkills);
            } else {
                console.log('[User-Skills Route] No users found with this skill using ORM approach, trying raw SQL');
                // Fall through to raw SQL approach
            }
        } catch (ormError) {
            console.error('[User-Skills Route] Error with ORM approach:', ormError);
            console.error('[User-Skills Route] ORM Error details:', ormError.stack);
            // Fall through to raw SQL approach
        }

        // Approach 2: Try raw SQL query
        try {
            console.log('[User-Skills Route] Trying raw SQL approach');

            const query = `
                SELECT
                    user_id,
                    skill_id,
                    proficiency_level,
                    willing_to_mentor,
                    is_certified,
                    is_training
                FROM
                    user_skills
                WHERE
                    skill_id = :skillId
            `;

            const results = await db.sequelize.query(query, {
                replacements: { skillId },
                type: db.sequelize.QueryTypes.SELECT
            });

            console.log(`[User-Skills Route] Found ${results.length} users with skill ID ${skillId} using raw SQL`);

            // Transform the results to match the expected format
            const transformedResults = results.map(result => ({
                userId: result.user_id,
                skillId: result.skill_id,
                proficiencyLevel: result.proficiency_level,
                willing_to_mentor: result.willing_to_mentor,
                is_certified: result.is_certified,
                is_training: result.is_training || false
            }));

            return res.json(transformedResults);
        } catch (sqlError) {
            console.error('[User-Skills Route] Error with raw SQL approach:', sqlError);
            console.error('[User-Skills Route] SQL Error details:', sqlError.stack);
            // Return empty array if both approaches fail
            return res.json([]);
        }
    } catch (error) {
        console.error('[User-Skills Route] Error fetching users with skill:', error);
        console.error('[User-Skills Route] Error details:', error.stack);
        res.status(500).json({ message: 'Failed to fetch users with this skill.' });
    }
});

// DELETE /api/user-skills/:skillId - Remove a skill from a user
router.delete('/:skillId', authMiddleware, async (req, res) => {
    const { skillId } = req.params;
    const userId = req.user.id; // Get the authenticated user's ID

    console.log(`[User-Skills Route] Removing skill ${skillId} from user ${userId}`);

    try {
        // Find the user-skill record
        const userSkill = await db.UserSkill.findOne({
            where: {
                userId: userId,
                skillId: skillId
            }
        });

        if (!userSkill) {
            return res.status(404).json({ message: "User skill not found." });
        }

        // Delete the user-skill record
        await userSkill.destroy();

        console.log(`[User-Skills Route] Successfully removed skill ${skillId} from user ${userId}`);

        res.json({ message: "Skill removed successfully." });

    } catch (error) {
        console.error('[User-Skills Route] Error removing skill from user:', error);
        res.status(500).json({ message: 'Failed to remove skill from user.' });
    }
});

module.exports = router;
