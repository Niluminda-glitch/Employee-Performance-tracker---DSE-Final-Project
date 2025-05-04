const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/role-check');

// Get current user's requests
router.get('/my', authMiddleware, requestController.getMyRequests);

// Create a new request
router.post('/', authMiddleware, requestController.createRequest);

// Get team requests (for supervisors)
router.get('/team', authMiddleware, roleCheck(['supervisor', 'manager']), requestController.getTeamRequests);

// Get all requests (for managers)
router.get('/all', authMiddleware, roleCheck(['manager']), requestController.getAllRequests);

// Update request status (approve/reject)
router.put('/:id/status', authMiddleware, roleCheck(['supervisor', 'manager']), requestController.updateRequestStatus);

module.exports = router;
