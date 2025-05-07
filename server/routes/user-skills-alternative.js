// Alternative implementation for user skills endpoint
// This file provides a backup implementation using Sequelize ORM
// Copy this code to user.routes.js if the raw SQL approach doesn't work

// Get user skills (Alternative implementation using Sequelize ORM)
router.get('/:id/skills', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`[User Routes] Fetching skills for user ID: ${userId}`);

    // First, let's check if the user exists
    const userExists = await db.User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Approach 1: Use the User model with eager loading of skills
    const user = await db.User.findByPk(userId, {
      include: [{
        model: db.Skill,
        as: 'skills',
        through: {
          attributes: ['proficiencyLevel', 'canMentor', 'isCertified', 'isTraining']
        }
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform the data to be more frontend-friendly
    const transformedSkills = user.skills.map(skill => ({
      skillId: skill.id,
      name: skill.name,
      description: skill.description,
      proficiencyLevel: skill.UserSkill.proficiencyLevel,
      willing_to_mentor: skill.UserSkill.canMentor,
      is_certified: skill.UserSkill.isCertified,
      is_training: skill.UserSkill.isTraining || false
    }));

    console.log(`[User Routes] Found ${transformedSkills.length} skills for user ID: ${userId}`);

    // Log the first user skill for debugging
    if (transformedSkills.length > 0) {
      console.log('[User Routes] First user skill example:', JSON.stringify(transformedSkills[0], null, 2));
    }

    res.json(transformedSkills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approach 2: Alternative implementation using direct UserSkill query
// Uncomment and use this if Approach 1 doesn't work
/*
router.get('/:id/skills', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`[User Routes] Fetching skills for user ID: ${userId}`);

    // First, let's check if the user exists
    const userExists = await db.User.findByPk(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query the UserSkill model with explicit column names
    const userSkills = await db.UserSkill.findAll({
      where: {
        user_id: userId // Use the actual column name in the database
      },
      include: [{
        model: db.Skill,
        as: 'skill',
        attributes: ['id', 'name', 'description']
      }],
      // Explicitly specify the attributes we want from UserSkill
      attributes: [
        'proficiency_level',
        'willing_to_mentor',
        'is_certified',
        'is_training'
      ]
    });

    console.log(`[User Routes] Found ${userSkills.length} skills for user ID: ${userId}`);

    // Transform the data to be more frontend-friendly
    const transformedSkills = userSkills.map(userSkill => {
      const plainData = userSkill.get({ plain: true });
      
      return {
        skillId: plainData.skill?.id,
        name: plainData.skill?.name,
        description: plainData.skill?.description,
        proficiencyLevel: plainData.proficiency_level,
        willing_to_mentor: plainData.willing_to_mentor,
        is_certified: plainData.is_certified,
        is_training: plainData.is_training || false
      };
    });

    res.json(transformedSkills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});
*/
