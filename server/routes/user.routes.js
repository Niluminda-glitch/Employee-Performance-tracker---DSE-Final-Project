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
router.put('/:id', async (req, res) => {
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
    const { full_name, job_title, department_id } = req.body;
    
    // Update only provided fields
    if (full_name) user.full_name = full_name;
    if (job_title) user.job_title = job_title;
    if (department_id) user.department_id = department_id;
    
    await user.save();
    
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
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user skills
router.get('/:id/skills', async (req, res) => {
  try {
    const userSkills = await db.UserSkill.findAll({
      where: { user_id: req.params.id },
      include: [
        {
          model: db.Skill,
          attributes: ['id', 'name', 'description']
        }
      ]
    });
    
    res.json(userSkills);
  } catch (error) {
    console.error('Error fetching user skills:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
