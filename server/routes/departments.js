// server/routes/departments.js
const express = require('express');
const db = require('../models'); // Import models
const authMiddleware = require('../middleware/authMiddleware');
const { v4: uuidv4 } = require('uuid');

// Role check middleware
const roleCheck = require('../middleware/role-check');
const requireManager = roleCheck(['manager']);

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
            // First, try to query the departments table with all attributes
            const departments = await db.Department.findAll({
                attributes: ['id', 'name', 'description', 'created_at', 'updated_at'],
                order: [['name', 'ASC']]
            });
            console.log(`[Departments Route] Found ${departments ? departments.length : 'null'} departments.`);

            // Get headcount for each department
            const departmentsWithStats = await Promise.all(departments.map(async (dept) => {
                const headcount = await db.User.count({
                    where: { department_id: dept.id }
                });

                // Return department with headcount
                return {
                    ...dept.toJSON(),
                    headcount
                };
            }));

            // If we get here, the table exists and we can return the departments
            res.json(departmentsWithStats || []); // Send empty array if null/undefined
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

// POST /api/departments - Create a new department (Manager only)
router.post('/', authMiddleware, requireManager, async (req, res) => {
    const { name, description } = req.body;
    const managerId = req.user.id; // Get the ID of the manager creating the department

    console.log(`[Departments Route] Creating new department: ${name}, requested by manager ${managerId}`);

    // Basic validation
    if (!name) {
        return res.status(400).json({ message: 'Department name is required.' });
    }

    try {
        // Check if department with this name already exists
        const existingDepartment = await db.Department.findOne({
            where: { name }
        });

        if (existingDepartment) {
            return res.status(400).json({ message: 'A department with this name already exists.' });
        }

        // Create the department
        const department = await db.Department.create({
            name,
            description: description || null,
            // Use the timestamp fields that match our schema
            created_at: new Date(),
            updated_at: new Date()
        });

        console.log(`[Departments Route] Department created successfully with ID: ${department.id}`);

        // Return the created department
        res.status(201).json(department);
    } catch (error) {
        console.error('[Departments Route] Error creating department:', error);
        res.status(500).json({ message: 'Failed to create department.' });
    }
});

// GET /api/departments/:id - Get a specific department
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    console.log(`[Departments Route] Fetching department with ID: ${id}`);

    try {
        const department = await db.Department.findByPk(id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        res.json(department);
    } catch (error) {
        console.error(`[Departments Route] Error fetching department with ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to retrieve department.' });
    }
});

// PUT /api/departments/:id - Update a department (Manager only)
router.put('/:id', authMiddleware, requireManager, async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    const managerId = req.user.id;

    console.log(`[Departments Route] Updating department with ID: ${id}, requested by manager ${managerId}`);

    // Basic validation
    if (!name) {
        return res.status(400).json({ message: 'Department name is required.' });
    }

    try {
        // Check if department exists
        const department = await db.Department.findByPk(id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        // Check if another department with the same name exists
        const existingDepartment = await db.Department.findOne({
            where: {
                name,
                id: { [db.Sequelize.Op.ne]: id } // Not the current department
            }
        });

        if (existingDepartment) {
            return res.status(400).json({ message: 'Another department with this name already exists.' });
        }

        // Update the department
        await department.update({
            name,
            description: description || null,
            updated_at: new Date()
        });

        console.log(`[Departments Route] Department updated successfully: ${department.id}`);

        res.json(department);
    } catch (error) {
        console.error(`[Departments Route] Error updating department with ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to update department.' });
    }
});

// DELETE /api/departments/:id - Delete a department (Manager only)
router.delete('/:id', authMiddleware, requireManager, async (req, res) => {
    const { id } = req.params;
    const managerId = req.user.id;

    console.log(`[Departments Route] Deleting department with ID: ${id}, requested by manager ${managerId}`);

    try {
        // Check if department exists
        const department = await db.Department.findByPk(id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found.' });
        }

        // Check if there are users in this department
        const usersInDepartment = await db.User.count({
            where: { department_id: id }
        });

        if (usersInDepartment > 0) {
            return res.status(400).json({
                message: `Cannot delete department with ${usersInDepartment} users. Reassign users first.`
            });
        }

        // Delete the department
        await department.destroy();

        console.log(`[Departments Route] Department deleted successfully: ${id}`);

        res.json({ message: 'Department deleted successfully.' });
    } catch (error) {
        console.error(`[Departments Route] Error deleting department with ID ${id}:`, error);
        res.status(500).json({ message: 'Failed to delete department.' });
    }
});

module.exports = router;
