const db = require('../models');
const Notification = db.Notification;
const User = db.User;
const Task = db.Task;
const { Op } = require('sequelize');

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'relatedUser',
          attributes: ['id', 'full_name', 'email', 'role']
        },
        {
          model: Task,
          as: 'relatedTask',
          attributes: ['id', 'title', 'description', 'status', 'priority', 'due_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

// Get all system notifications (announcements and system messages)
exports.getAllSystemNotifications = async (req, res) => {
  try {
    // Get all system and announcement notifications
    const notifications = await Notification.findAll({
      where: {
        type: {
          [Op.in]: ['system', 'announcement']
        }
      },
      include: [
        {
          model: User,
          as: 'relatedUser',
          attributes: ['id', 'full_name', 'email', 'role', 'job_title']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'role', 'job_title']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Group notifications by their content (title, message, type)
    // This will help us identify unique notifications that were sent to multiple users
    const uniqueNotifications = [];
    const notificationGroups = {};

    notifications.forEach(notification => {
      // Create a key based on the notification content and sender
      const key = `${notification.title}|${notification.message}|${notification.type}|${notification.related_user_id}|${notification.created_at}`;

      if (!notificationGroups[key]) {
        notificationGroups[key] = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          created_at: notification.created_at,
          sender: notification.relatedUser,
          recipients: []
        };
      }

      // Add recipient to the group
      notificationGroups[key].recipients.push({
        id: notification.user.id,
        full_name: notification.user.full_name,
        role: notification.user.role,
        job_title: notification.user.job_title
      });
    });

    // Convert groups to array
    for (const key in notificationGroups) {
      uniqueNotifications.push(notificationGroups[key]);
    }

    return res.status(200).json(uniqueNotifications);
  } catch (error) {
    console.error('Error fetching system notifications:', error);
    return res.status(500).json({ message: 'Failed to fetch system notifications', error: error.message });
  }
};

// Get unread notifications count for the current user
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });

    return res.status(200).json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return res.status(500).json({ message: 'Failed to fetch unread count', error: error.message });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, user_id, related_task_id, related_user_id } = req.body;

    // Validate required fields
    if (!title || !message || !type || !user_id) {
      return res.status(400).json({ message: 'Title, message, type, and user_id are required' });
    }

    // Validate notification type
    const validTypes = [
      'system',
      'task_assigned',
      'task_completed',
      'deadline_reminder',
      'mentorship_request',
      'request_approved',
      'request_rejected',
      'announcement'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    // Check if user exists
    const userExists = await User.findByPk(user_id);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification
    const notification = await Notification.create({
      title,
      message,
      type,
      user_id,
      related_task_id,
      related_user_id,
      is_read: false
    });

    return res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Failed to create notification', error: error.message });
  }
};

// Create notifications for multiple users
exports.createBulkNotifications = async (req, res) => {
  try {
    const { title, message, type, user_ids, related_task_id } = req.body;
    const creatorId = req.user.id;

    // Validate required fields
    if (!title || !message || !type || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        message: 'Title, message, type, and user_ids array are required'
      });
    }

    // Validate notification type
    const validTypes = [
      'system',
      'task_assigned',
      'task_completed',
      'deadline_reminder',
      'mentorship_request',
      'request_approved',
      'request_rejected',
      'announcement'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid notification type' });
    }

    // Check if users exist
    const users = await User.findAll({
      where: {
        id: {
          [Op.in]: user_ids
        }
      }
    });

    if (users.length !== user_ids.length) {
      return res.status(404).json({ message: 'One or more users not found' });
    }

    // Add the creator to the recipients if not already included
    if (!user_ids.includes(creatorId)) {
      user_ids.push(creatorId);
    }

    // Create notifications for each user
    const notificationsData = user_ids.map(userId => ({
      title,
      message,
      type,
      user_id: userId,
      related_task_id,
      related_user_id: creatorId, // Set the creator as the related user
      is_read: userId === creatorId // Mark as read for the creator
    }));

    const notifications = await Notification.bulkCreate(notificationsData);

    return res.status(201).json({
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    return res.status(500).json({ message: 'Failed to create notifications', error: error.message });
  }
};

// Create a system-wide notification for all users
exports.createSystemNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const creatorId = req.user.id;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Title, message, and type are required' });
    }

    // Validate notification type
    const validTypes = ['system', 'announcement'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: 'Invalid notification type for system notification. Must be "system" or "announcement"'
      });
    }

    // Get all active users (including the creator)
    const users = await User.findAll({
      where: {
        status: 'active' // Only send to active users
      }
    });

    // Create notifications for each user
    const notificationsData = users.map(user => ({
      title,
      message,
      type,
      user_id: user.id,
      related_user_id: creatorId, // Set the creator as the related user
      is_read: user.id === creatorId, // Mark as read for the creator
    }));

    const notifications = await Notification.bulkCreate(notificationsData);

    return res.status(201).json({
      message: `Notification sent to ${notifications.length} users`,
      count: notifications.length,
      notifications: notifications
    });
  } catch (error) {
    console.error('Error creating system notification:', error);
    return res.status(500).json({ message: 'Failed to create system notification', error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.is_read = true;
    await notification.save();

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Failed to mark notification as read', error: error.message });
  }
};

// Mark all notifications as read for the current user
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );

    return res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({ message: 'Failed to mark all notifications as read', error: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id,
        user_id: userId
      }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};
