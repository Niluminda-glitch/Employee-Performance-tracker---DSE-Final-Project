// server/routes/operations.js
const express = require('express');
const db = require('../models'); // Import models
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Log available models for debugging
console.log('[Operations Route] Available models:', Object.keys(db));

// --- Route to get LIST of all operations ---
// GET /api/operations
router.get('/', async (req, res) => {
    // Middleware (authMiddleware) should have already run
    console.log(`[Operations Route] Fetching list of all operations for user ${req.user.id}`);
    try {
        const operations = await db.Operation.findAll({
            attributes: ['id', 'name', 'number'], // Only fetch needed fields for list
            order: [['name', 'ASC']]
        });

        console.log(`[Operations Route] Found ${operations.length} operations`);
        res.json(operations);
    } catch (error) {
        console.error('[Operations Route] Error fetching operations list:', error);
        res.status(500).json({ message: 'Failed to retrieve operations list.' });
    }
});

// --- Route to get DETAILS of a specific operation ---
// GET /api/operations/:id/details
router.get('/:id/details', async (req, res) => {
    // Middleware (authMiddleware) should have already run
    const { id } = req.params; // Get ID from URL parameter
    console.log(`[Operations Route] Fetching details for operation ID: ${id} for user ${req.user.id}`);

    // Basic validation for UUID format
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
        return res.status(400).json({ message: 'Invalid operation ID format.' });
    }

    try {
        const operationDetails = await db.Operation.findByPk(id, {
            // Select all relevant fields for the details view
            attributes: ['id', 'name', 'number', 'quality_checkpoints', 'smv_target', 'sop_url']
        });

        if (!operationDetails) {
            return res.status(404).json({ message: 'Operation not found.' });
        }

        console.log(`[Operations Route] Found details for operation: ${operationDetails.name}`);
        res.json(operationDetails);
    } catch (error) {
        console.error(`[Operations Route] Error fetching details for operation ${id}:`, error);
        res.status(500).json({ message: 'Failed to retrieve operation details.' });
    }
});

module.exports = router;
