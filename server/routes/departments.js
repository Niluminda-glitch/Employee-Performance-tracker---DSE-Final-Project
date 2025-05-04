// server/routes/departments.js
const express = require('express');
const db = require('../models'); // Import models
const authMiddleware = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// GET /api/departments - Fetch all departments
router.get('/', async (req, res) => {
    console.log(`[Departments Route] Fetching all departments request received.`);

    // Add this check:
    if (!db.Department) {
        console.error('[Departments Route] CRITICAL ERROR: Department model is undefined or not imported correctly!');
        return res.status(500).json({ message: 'Server configuration error: Department model not available.' });
    }
    console.log('[Departments Route] Department model seems to be loaded.');

    try {
        console.log('[Departments Route] Attempting Department.findAll()');
        console.log('[Departments Route] Department model:', typeof db.Department);
        console.log('[Departments Route] Department.findAll:', typeof db.Department.findAll);

        try {
            // First, try to query the departments table
            const departments = await db.Department.findAll({
                attributes: ['id', 'name'],
                order: [['name', 'ASC']]
            });
            console.log(`[Departments Route] Found ${departments ? departments.length : 'null'} departments.`);

            // If we get here, the table exists and we can return the departments
            res.json(departments || []); // Send empty array if null/undefined
        } catch (tableError) {
            console.error('[Departments Route] Error querying departments table:', tableError);

            // If the error is that the table doesn't exist, create it
            if (tableError.name === 'SequelizeDatabaseError' &&
                tableError.parent &&
                tableError.parent.message.includes('relation "departments" does not exist')) {

                console.log('[Departments Route] Departments table does not exist. Creating it...');

                try {
                    // Create the departments table
                    await db.sequelize.sync({ force: false });
                    console.log('[Departments Route] Database synced. Departments table should be created now.');

                    // Add sample departments
                    const sampleDepartments = [
                        { name: 'Engineering', description: 'Software development and engineering' },
                        { name: 'Marketing', description: 'Marketing and sales' },
                        { name: 'Human Resources', description: 'HR and recruitment' },
                        { name: 'Operations', description: 'Operations and logistics' }
                    ];

                    await db.Department.bulkCreate(sampleDepartments);
                    console.log('[Departments Route] Sample departments added successfully.');

                    // Now try to fetch the departments again
                    const newDepartments = await db.Department.findAll({
                        attributes: ['id', 'name'],
                        order: [['name', 'ASC']]
                    });
                    console.log(`[Departments Route] Found ${newDepartments.length} departments after creation.`);

                    res.json(newDepartments);
                } catch (syncError) {
                    console.error('[Departments Route] Error syncing database:', syncError);
                    throw syncError;
                }
            } else if (tableError.name === 'SequelizeDatabaseError' &&
                      tableError.parent &&
                      tableError.parent.message.includes('column "departments.description" does not exist')) {

                console.log('[Departments Route] Description column is missing. Fetching only id and name...');

                try {
                    // Try to fetch only the id and name columns
                    const departmentsWithoutDescription = await db.Department.findAll({
                        attributes: ['id', 'name'],
                        order: [['name', 'ASC']]
                    });
                    console.log(`[Departments Route] Found ${departmentsWithoutDescription.length} departments (without description).`);

                    res.json(departmentsWithoutDescription);
                } catch (fetchError) {
                    console.error('[Departments Route] Error fetching departments without description:', fetchError);
                    throw fetchError;
                }
            } else {
                // If it's a different error, rethrow it
                throw tableError;
            }
        }
    } catch (error) {
        console.error('[Departments Route] Error during Department.findAll():', error); // Log the full error object
        console.error('[Departments Route] Error name:', error.name);
        console.error('[Departments Route] Error message:', error.message);
        if (error.parent) {
            console.error('[Departments Route] Database error:', error.parent.message);
        }

        // Try a direct database query as a last resort
        try {
            console.log('[Departments Route] Attempting direct database query as fallback...');

            const [results] = await db.sequelize.query('SELECT id, name FROM departments ORDER BY name ASC');
            console.log(`[Departments Route] Direct query found ${results.length} departments.`);

            res.json(results);
        } catch (directQueryError) {
            console.error('[Departments Route] Direct query also failed:', directQueryError);
            res.status(500).json({ message: 'Failed to retrieve departments' });
        }
    }
});

module.exports = router;
