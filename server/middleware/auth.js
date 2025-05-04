// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

module.exports = async function(req, res, next) {
    // Get token from header
    let token = req.header('x-auth-token');

    // If token is not found in x-auth-token, check authorization header
    if (!token && req.headers.authorization) {
        // Check if it's a Bearer token
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
        }
    }

    // Check if no token is present
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("FATAL ERROR: JWT_SECRET is not defined.");
            return res.status(500).json({ message: "Server configuration error." });
        }

        // Verify token
        const decoded = jwt.verify(token, secret);
        
        // Attach user to request
        req.user = decoded.user;
        
        // Optionally fetch full user details from database
        try {
            const user = await User.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            // Check if user is active
            if (user.status !== 'active') {
                return res.status(403).json({ message: 'Account is inactive' });
            }
            
            // Attach full user object to request
            req.fullUser = user;
        } catch (dbError) {
            console.error('Database error in auth middleware:', dbError);
            // Continue even if database fetch fails
        }
        
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access denied. Token has expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Access denied. Invalid token.' });
        }
        
        res.status(401).json({ message: 'Token verification failed.' });
    }
};
