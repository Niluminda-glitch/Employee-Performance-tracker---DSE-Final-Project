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
    
    try {
        // Check if user exists
        const userExists = await db.User.findByPk(userId);
        if (!userExists) {
            return res.status(404).json({ message: "User not found." });
        }
        
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
        
        // Transform the data to be more frontend-friendly
        const transformedSkills = userSkills.map(userSkill => ({
            skillId: userSkill.skill.id,
            name: userSkill.skill.name,
            description: userSkill.skill.description,
            proficiencyLevel: userSkill.proficiencyLevel,
            willing_to_mentor: userSkill.willing_to_mentor,
            is_certified: userSkill.is_certified,
            is_training: userSkill.is_training
        }));
        
        res.json(transformedSkills);
        
    } catch (error) {
        console.error('[User-Skills Route] Error fetching skills for user:', error);
        res.status(500).json({ message: 'Failed to fetch skills for user.' });
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
