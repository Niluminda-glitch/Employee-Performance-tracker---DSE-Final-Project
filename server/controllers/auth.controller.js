const db = require('../models');
const User = db.user;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Register a new user
exports.signup = async (req, res) => {
  try {
    // Validate request
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res.status(400).send({ message: "Email, password, and name are required!" });
    }

    // Create user
    const user = await User.create({
      email: req.body.email,
      password: req.body.password,
      full_name: req.body.name,
      role: req.body.role || 'employee',
      job_title: req.body.job_title,
      department_id: req.body.department_id,
      supervisor_id: req.body.supervisor_id,
      status: 'first_login'
    });

    res.status(201).send({
      message: "User registered successfully!",
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while creating the user."
    });
  }
};

// User login
exports.signin = async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Check password
    const passwordIsValid = await user.validPassword(req.body.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid password!"
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user info and token
    res.status(200).send({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      accessToken: token
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred during login."
    });
  }
};

// Google OAuth login
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { email: email },
          { google_id: googleId }
        ]
      }
    });

    if (!user) {
      // Create new user if not exists
      user = await User.create({
        email,
        full_name: name,
        google_id: googleId,
        avatar_url: picture,
        status: 'active'
      });
    } else if (!user.google_id) {
      // Update existing user with Google ID if they signed up with email/password
      user.google_id = googleId;
      user.avatar_url = picture || user.avatar_url;
      await user.save();
    }

    // Generate token
    const jwtToken = generateToken(user);

    // Return user info and token
    res.status(200).send({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      accessToken: jwtToken
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred during Google login."
    });
  }
};

// Reset password request
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).send({
        message: "If your email is registered, you will receive a password reset link."
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Store it in the database with an expiration
    // 3. Send an email with a reset link

    // For this example, we'll just acknowledge the request
    res.status(200).send({
      message: "If your email is registered, you will receive a password reset link."
    });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred during password reset request."
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { userId, password } = req.body;

    // Find user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Update password
    user.password = password;
    user.status = 'active'; // Update status if it was 'first_login'
    await user.save();

    res.status(200).send({ message: "Password reset successfully." });
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred during password reset."
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving user."
    });
  }
};
