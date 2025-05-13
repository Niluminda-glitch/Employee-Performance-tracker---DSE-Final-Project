const db = require('../models');
const Request = db.Request;
const User = db.User;
const Notification = db.Notification;
const { Op } = require('sequelize');

// Get all requests for the current user
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await Request.findAll({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({ message: 'Failed to fetch requests', error: error.message });
  }
};

// Get requests for a supervisor's team
exports.getTeamRequests = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    // Get all team members (users where supervisor_id = current user's id)
    const teamMembers = await User.findAll({
      where: { supervisor_id: supervisorId }
    });

    const teamMemberIds = teamMembers.map(member => member.id);

    // Get requests from team members
    const requests = await Request.findAll({
      where: {
        user_id: {
          [Op.in]: teamMemberIds
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'job_title']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching team requests:', error);
    return res.status(500).json({ message: 'Failed to fetch team requests', error: error.message });
  }
};

// Get all requests (for managers)
exports.getAllRequests = async (req, res) => {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Only managers can view all requests.' });
    }

    const requests = await Request.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'job_title']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'full_name', 'email', 'role']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    return res.status(500).json({ message: 'Failed to fetch all requests', error: error.message });
  }
};

// Create a new request
exports.createRequest = async (req, res) => {
  try {
    const { type, start_date, end_date, hours, reason } = req.body;
    const userId = req.user.id;

    console.log(`Creating ${type} request for user ${userId} from ${start_date} to ${end_date}`);

    // Validate required fields
    if (!type || !start_date || !end_date || !reason) {
      return res.status(400).json({ message: 'Type, start date, end date, and reason are required' });
    }

    // Validate request type
    if (type !== 'leave' && type !== 'overtime') {
      return res.status(400).json({ message: 'Invalid request type. Must be "leave" or "overtime"' });
    }

    // Validate hours for overtime requests
    if (type === 'overtime' && (!hours || hours <= 0)) {
      return res.status(400).json({ message: 'Hours are required for overtime requests and must be greater than 0' });
    }

    // Create request
    let request;
    try {
      request = await Request.create({
        user_id: userId,
        type,
        start_date,
        end_date,
        hours: type === 'overtime' ? hours : null,
        reason,
        status: 'pending'
      });
      console.log(`Request created successfully with ID: ${request.id}`);
    } catch (requestError) {
      console.error('Error creating request record:', requestError);
      return res.status(500).json({ message: 'Failed to create request record', error: requestError.message });
    }

    // Get user's supervisor
    let user;
    try {
      user = await User.findByPk(userId, {
        include: [
          {
            model: User,
            as: 'supervisor',
            attributes: ['id', 'full_name', 'email']
          }
        ]
      });
      console.log(`User found: ${user.full_name}, Supervisor: ${user.supervisor ? user.supervisor.full_name : 'None'}`);
    } catch (userError) {
      console.error('Error fetching user details:', userError);
      // Return the created request even if we can't fetch the user details
      return res.status(201).json(request);
    }

    // Create notification for supervisor if user has one
    if (user.supervisor && user.supervisor.id) {
      try {
        // First try with 'request_submitted' type
        try {
          await Notification.create({
            title: `New ${type} request`,
            message: `${user.full_name} has submitted a ${type} request from ${start_date} to ${end_date}`,
            type: 'request_submitted',
            user_id: user.supervisor.id,
            related_user_id: userId,
            is_read: false
          });
          console.log(`Notification created with type 'request_submitted' for supervisor ${user.supervisor.id}`);
        } catch (enumError) {
          // If that fails, fall back to 'system' type
          console.log('Falling back to system notification type');
          await Notification.create({
            title: `New ${type} request`,
            message: `${user.full_name} has submitted a ${type} request from ${start_date} to ${end_date}`,
            type: 'system',
            user_id: user.supervisor.id,
            related_user_id: userId,
            is_read: false
          });
          console.log(`Notification created with type 'system' for supervisor ${user.supervisor.id}`);
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Continue with the request creation even if notification fails
      }
    } else {
      console.log('User has no supervisor, skipping notification');
    }

    return res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({ message: 'Failed to create request', error: error.message });
  }
};

// Update request status (approve/reject)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const approverId = req.user.id;

    // Validate status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected"' });
    }

    // Find the request
    const request = await Request.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is authorized to approve/reject
    const user = await User.findByPk(req.user.id);
    const requestUser = await User.findByPk(request.user_id);

    // Only allow supervisors of the user or managers to approve/reject
    if (user.role !== 'manager' && requestUser.supervisor_id !== approverId) {
      return res.status(403).json({
        message: 'Access denied. Only the user\'s supervisor or managers can approve/reject requests.'
      });
    }

    // Update request
    request.status = status;
    request.approver_id = approverId;
    await request.save();

    // Create notification for the user
    try {
      await Notification.create({
        title: `${status === 'approved' ? 'Request Approved' : 'Request Rejected'}`,
        message: `Your ${request.type} request from ${request.start_date} to ${request.end_date} has been ${status}`,
        type: status === 'approved' ? 'request_approved' : 'request_rejected',
        user_id: request.user_id,
        related_user_id: approverId,
        is_read: false
      });
      console.log(`Notification created for user ${request.user_id} about request ${status}`);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Continue with the request update even if notification fails
    }

    return res.status(200).json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    return res.status(500).json({ message: 'Failed to update request status', error: error.message });
  }
};
