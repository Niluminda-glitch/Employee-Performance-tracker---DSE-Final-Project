const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/authMiddleware');

// Sample data for departments and supervisors
const departments = [
  { id: 1, name: 'HR' },
  { id: 2, name: 'Engineering' },
  { id: 3, name: 'Marketing' }
];

const supervisors = [
  { id: 1, full_name: 'John Doe' },
  { id: 2, full_name: 'Jane Smith' },
  { id: 3, full_name: 'Alice Johnson' }
];

// Get all notifications for the current user
router.get('/', auth, notificationController.getUserNotifications);

// Get all system notifications (announcements and system messages)
router.get('/system-all', auth, notificationController.getAllSystemNotifications);

// Get unread notifications count for the current user
router.get('/unread', auth, notificationController.getUnreadCount);

// Create a new notification (requires authentication)
router.post('/', auth, notificationController.createNotification);

// Routes for sample data
router.get('/departments', async (req, res) => {
  res.json(departments);
});

router.get('/supervisors', async (req, res) => {
  res.json(supervisors);
});

// Create notifications for multiple users (allows all authenticated users)
router.post('/bulk', auth, notificationController.createBulkNotifications);

// Create a system-wide notification for all users (allows all authenticated users)
router.post('/system', auth, notificationController.createSystemNotification);

// Mark a notification as read
router.put('/:id/read', auth, notificationController.markAsRead);

// Mark all notifications as read for the current user
router.put('/read-all', auth, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
