// server/middleware/role-check.js

/**
 * Middleware to check if the user has one of the allowed roles
 * @param {Array} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Middleware function
 */
module.exports = function(allowedRoles) {
    return function(req, res, next) {
        // Ensure user object exists (auth middleware should have set this)
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        
        // Check if user role is in the allowed roles array
        if (allowedRoles.includes(req.user.role)) {
            next(); // User has permission, proceed to the next middleware/route handler
        } else {
            // User doesn't have the required role
            return res.status(403).json({ 
                message: 'Access denied. Insufficient permissions.' 
            });
        }
    };
};
