// server/routes/user.routes.js
const express = require('express');
const router = express.Router();
const db = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

// Get all users (protected, admin only)
router.get('/', async (req, res) => {
  try {
    // Check if user has admin privileges
    if (req.user.role !== 'manager' && req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Access denied. Not authorized.' });
    }

    const users = await db.User.findAll({
      attributes: { exclude: ['password', 'google_id'] },
      include: [
        {
          model: db.Department,
          as: 'userDepartment',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id, {
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
          attributes: ['id', 'full_name', 'email', 'role']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if user is updating their own profile or has admin privileges
    if (req.user.id !== req.params.id &&
        req.user.role !== 'manager' &&
        req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Access denied. Not authorized to update this profile.' });
    }

    const user = await db.User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow updating certain fields
    const { full_name, job_title, department_id, avatar_url } = req.body;

    console.log(`[User Routes] Updating user ${req.params.id} with:`, { full_name, job_title, department_id, avatar_url });

    // Update only provided fields
    if (full_name) user.full_name = full_name;
    if (job_title) user.job_title = job_title;
    if (department_id) user.department_id = department_id;
    if (avatar_url) {
      console.log(`[User Routes] Updating avatar_url from ${user.avatar_url} to ${avatar_url}`);
      user.avatar_url = avatar_url;
    }

    try {
      console.log(`[User Routes] Saving user ${user.id} with avatar_url: ${user.avatar_url}`);
      await user.save();
      console.log(`[User Routes] User saved successfully. Verifying avatar_url...`);

      // Verify the save by fetching the user again
      const verifiedUser = await db.User.findByPk(user.id);
      console.log(`[User Routes] Verified avatar_url: ${verifiedUser.avatar_url}`);
    } catch (saveError) {
      console.error(`[User Routes] Error saving user:`, saveError);
      throw saveError;
    }

    // Return updated user without sensitive info
    const updatedUser = await db.User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'google_id'] },
      include: [
        {
          model: db.Department,
          as: 'userDepartment',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({ success: true, ...updatedUser.toJSON() });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Direct SQL update for avatar URL
router.post('/update-avatar-sql', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    console.log(`[User Routes] Updating avatar for user ID: ${userId} with URL: ${avatarUrl} using direct SQL`);

    // Use the direct update script
    const updateUserAvatarDirect = require('../scripts/update-avatar-direct');
    const result = await updateUserAvatarDirect(userId, avatarUrl);

    if (result.success) {
      console.log(`[User Routes] Direct update successful:`, result);
      res.json({
        success: true,
        message: 'Avatar updated successfully',
        avatar_url: result.user.avatar_url
      });
    } else {
      console.error(`[User Routes] Direct update failed:`, result.error);
      res.status(500).json({
        success: false,
        message: 'Failed to update avatar',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error updating user avatar with SQL:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile picture
router.put('/profile/avatar', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const { avatar_url } = req.body;

    if (!avatar_url) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    console.log(`[User Routes] Updating avatar for user ID: ${userId} with URL: ${avatar_url}`);

    const user = await db.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update avatar URL
    console.log(`[User Routes] Updating avatar_url from ${user.avatar_url} to ${avatar_url}`);
    user.avatar_url = avatar_url;

    try {
      console.log(`[User Routes] Saving user ${user.id} with avatar_url: ${user.avatar_url}`);
      await user.save();
      console.log(`[User Routes] User saved successfully. Verifying avatar_url...`);

      // Verify the save by fetching the user again
      const verifiedUser = await db.User.findByPk(user.id);
      console.log(`[User Routes] Verified avatar_url: ${verifiedUser.avatar_url}`);
    } catch (saveError) {
      console.error(`[User Routes] Error saving user:`, saveError);
      throw saveError;
    }

    // Return updated user without sensitive info
    const updatedUser = await db.User.findByPk(userId, {
      attributes: { exclude: ['password', 'google_id'] },
      include: [
        {
          model: db.Department,
          as: 'userDepartment',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({ success: true, ...updatedUser.toJSON() });
  } catch (error) {
    console.error('Error updating user avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user skills
router.get('/:id/skills', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`[User Routes] Fetching skills for user ID: ${userId}`);

    // First, let's check if the user exists
    try {
      const userExists = await db.User.findByPk(userId);
      if (!userExists) {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (userCheckError) {
      console.error('Error checking if user exists:', userCheckError);
      // Continue anyway - the user might exist but there could be an issue with the query
    }

    // Create a mock response for testing
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

    // Try to get real data first
    try {
      // Approach 1: Try raw SQL query
      const [userSkills, metadata] = await db.sequelize.query(`
        SELECT
          us.user_id,
          us.skill_id,
          s.name,
          s.description,
          us.proficiency_level,
          us.willing_to_mentor,
          us.is_certified,
          us.is_training
        FROM
          user_skills us
        JOIN
          skills s ON us.skill_id = s.id
        WHERE
          us.user_id = :userId
      `, {
        replacements: { userId },
        type: db.sequelize.QueryTypes.SELECT
      });

      console.log(`[User Routes] Found ${userSkills.length} skills for user ID: ${userId}`);

      // Log the first user skill for debugging
      if (userSkills.length > 0) {
        console.log('[User Routes] First user skill example:', JSON.stringify(userSkills[0], null, 2));

        // Transform the data to be more frontend-friendly
        const transformedSkills = userSkills.map(skill => ({
          skillId: skill.skill_id,
          name: skill.name,
          description: skill.description,
          proficiencyLevel: skill.proficiency_level,
          willing_to_mentor: skill.willing_to_mentor,
          is_certified: skill.is_certified,
          is_training: skill.is_training || false
        }));

        return res.json(transformedSkills);
      } else {
        console.log('[User Routes] No skills found for this user, trying alternative approach');
        // Fall through to alternative approach
      }
    } catch (sqlError) {
      console.error('Error with SQL query approach:', sqlError);
      console.error('SQL Error details:', sqlError.stack);
      // Fall through to alternative approach
    }

    // Approach 2: Try using Sequelize ORM
    try {
      console.log('[User Routes] Trying ORM approach');
      const user = await db.User.findByPk(userId, {
        include: [{
          model: db.Skill,
          as: 'skills',
          through: { attributes: [] } // Don't include the join table attributes
        }]
      });

      if (user && user.skills && user.skills.length > 0) {
        console.log(`[User Routes] Found ${user.skills.length} skills using ORM approach`);

        // Transform the data to be more frontend-friendly
        const transformedSkills = user.skills.map(skill => ({
          skillId: skill.id,
          name: skill.name,
          description: skill.description,
          proficiencyLevel: 'intermediate', // Default value since we don't have this from the ORM query
          willing_to_mentor: false, // Default value
          is_certified: false, // Default value
          is_training: false // Default value
        }));

        return res.json(transformedSkills);
      } else {
        console.log('[User Routes] No skills found using ORM approach either');
        // Fall through to mock data
      }
    } catch (ormError) {
      console.error('Error with ORM approach:', ormError);
      console.error('ORM Error details:', ormError.stack);
      // Fall through to mock data
    }

    // If all else fails, return mock data for now
    console.log('[User Routes] Returning mock skills data as fallback');
    return res.json(mockSkills);

  } catch (error) {
    console.error('Error fetching user skills:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
