const db = require('../models');
const User = db.user;

// Get all users (with pagination)
exports.findAll = async (req, res) => {
  try {
    const { page = 0, size = 10, role } = req.query;
    const limit = parseInt(size);
    const offset = page * limit;
    
    const condition = role ? { role: role } : null;
    
    const { count, rows } = await User.findAndCountAll({
      where: condition,
      limit,
      offset,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).send({
      totalItems: count,
      users: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving users."
    });
  }
};

// Get user by ID
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).send({ message: `User with id ${id} not found.` });
    }
    
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving user."
    });
  }
};

// Update user
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).send({ message: `User with id ${id} not found.` });
    }
    
    // Update user
    const [updated] = await User.update(req.body, {
      where: { id: id }
    });
    
    if (updated) {
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password'] }
      });
      return res.status(200).send(updatedUser);
    }
    
    res.status(500).send({ message: `Cannot update user with id ${id}` });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error updating user."
    });
  }
};

// Delete user
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    
    const deleted = await User.destroy({
      where: { id: id }
    });
    
    if (deleted) {
      return res.status(200).send({ message: "User deleted successfully!" });
    }
    
    res.status(404).send({ message: `User with id ${id} not found.` });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error deleting user."
    });
  }
};

// Get users by role
exports.findByRole = async (req, res) => {
  try {
    const role = req.params.role;
    
    const users = await User.findAll({
      where: { role: role },
      attributes: { exclude: ['password'] }
    });
    
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving users by role."
    });
  }
};

// Get supervisors (for dropdown lists)
exports.getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.findAll({
      where: { 
        role: {
          [db.Sequelize.Op.or]: ['supervisor', 'manager']
        }
      },
      attributes: ['id', 'name', 'email', 'role']
    });
    
    res.status(200).send(supervisors);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Error retrieving supervisors."
    });
  }
};
