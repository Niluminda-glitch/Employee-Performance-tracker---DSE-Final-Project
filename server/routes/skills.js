const express = require('express');
const router = express.Router();
const db = require('../models');
const { Skill } = db;
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/skills - Get all skills
router.get('/', async (req, res) => {
  try {
    console.log('[Skills Route] Fetching all skills from database');

    // Check if Skill model is properly loaded
    if (!Skill || typeof Skill.findAll !== 'function') {
      console.error('[Skills Route] Skill model is not properly loaded:', Skill);
      return res.status(500).json({ message: 'Server configuration error: Skill model not properly loaded.' });
    }

    // Log available models and database connection status
    console.log('[Skills Route] Available models:', Object.keys(db));
    console.log('[Skills Route] Database connection status:', db.sequelize.connectionManager.hasOwnProperty('pool') ? 'Pool exists' : 'No pool');

    // Check database connection
    try {
      await db.sequelize.authenticate();
      console.log('[Skills Route] Database connection is active');
    } catch (connError) {
      console.error('[Skills Route] Database connection error:', connError.message);
      return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    // Check if skills table exists
    try {
      // Try to query the database to see if the skills table exists
      const tableCheck = await db.sequelize.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'skills')",
        { type: db.sequelize.QueryTypes.SELECT }
      );

      const tableExists = tableCheck[0].exists;
      console.log(`[Skills Route] Skills table exists: ${tableExists}`);

      if (!tableExists) {
        console.log('[Skills Route] Attempting to create skills table');
        await db.sequelize.query(`
          CREATE TABLE IF NOT EXISTS skills (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(255) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('[Skills Route] Skills table created successfully');

        // Insert some initial skills
        console.log('[Skills Route] Inserting initial skills data');
        await db.sequelize.query(`
          INSERT INTO skills (id, name, description, created_at, updated_at)
          VALUES
            (uuid_generate_v4(), 'Button Attachment Machine', 'Operating machines for attaching buttons.', NOW(), NOW()),
            (uuid_generate_v4(), 'Collar Assembly', 'Methods for assembling and attaching collars', NOW(), NOW()),
            (uuid_generate_v4(), 'Cutting Machine Operation', 'Operating cutting machines safely and efficiently', NOW(), NOW()),
            (uuid_generate_v4(), 'Embroidery', 'Decorative needlework techniques', NOW(), NOW()),
            (uuid_generate_v4(), 'Fabric Quality Control', 'Identifying fabric defects like holes, stains, or inconsistencies.', NOW(), NOW())
          ON CONFLICT (name) DO NOTHING
        `);
        console.log('[Skills Route] Initial skills data inserted');
      }
    } catch (tableError) {
      console.error('[Skills Route] Error checking/creating skills table:', tableError.message);
      return res.status(500).json({ message: 'Error checking or creating skills table.' });
    }

    // Fetch skills from database
    console.log('[Skills Route] Querying skills from database');
    const skills = await Skill.findAll({
      attributes: ['id', 'name', 'description'], // Removed 'category' as it doesn't exist in the database
      order: [['name', 'ASC']]
    });

    console.log(`[Skills Route] Successfully fetched ${skills.length} skills from database`);

    // Log the first few skills for debugging
    if (skills.length > 0) {
      console.log('[Skills Route] First skill example:', JSON.stringify(skills[0]));
    }

    // Return the skills from the database
    return res.json(skills);

  } catch (error) {
    console.error('[Skills Route] Error fetching skills:', error);
    console.error('[Skills Route] Error details:', error.message);
    if (error.stack) {
      console.error('[Skills Route] Error stack:', error.stack);
    }

    // Return error instead of mock data
    return res.status(500).json({
      message: 'Failed to retrieve skills from database. Please try again later.',
      error: error.message
    });
  }
});

// GET /api/skills/:id - Get a specific skill
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Skills Route] Fetching skill with ID: ${id}`);

    const skill = await Skill.findByPk(id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found.' });
    }

    res.json(skill);
  } catch (error) {
    console.error(`[Skills Route] Error fetching skill with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to retrieve skill.' });
  }
});

// POST /api/skills - Create a new skill
router.post('/', async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Skill name is required.' });
    }

    console.log(`[Skills Route] Creating new skill: ${name}`);

    const skill = await Skill.create({
      name,
      description,
      category
    });

    res.status(201).json(skill);
  } catch (error) {
    console.error('[Skills Route] Error creating skill:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'A skill with this name already exists.' });
    }

    res.status(500).json({ message: 'Failed to create skill.' });
  }
});

module.exports = router;
