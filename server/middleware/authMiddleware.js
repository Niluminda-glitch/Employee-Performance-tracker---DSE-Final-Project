// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Middleware function
module.exports = function(req, res, next) {
    // Log all request headers for debugging
    console.log('[AuthMiddleware] Request Headers:', JSON.stringify(req.headers, null, 2));

    // 1. Get token from header
    // We'll look for it in 'x-auth-token'. Clients need to send it with this header name.
    // Also check for 'authorization' header as a fallback
    let token = req.header('x-auth-token');

    // If token is not found in x-auth-token, check authorization header
    if (!token && req.headers.authorization) {
        // Check if it's a Bearer token
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7); // Remove 'Bearer ' prefix
            console.log('[AuthMiddleware] Token found in Authorization header');
        }
    }

    console.log('[AuthMiddleware] Attempting to read x-auth-token header. Value found:',
        token ? `<${token.substring(0, 10)}...>` : 'NONE');

    // 2. Check if no token is present
    if (!token) {
        console.error('[AuthMiddleware] Condition (!token) is TRUE. Sending 401.');
        // 401 Unauthorized: Credentials needed but not provided.
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // 3. Verify the token
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
             // Safety check - should have been caught on startup or login
             console.error("[AuthMiddleware] FATAL ERROR: JWT_SECRET is not defined.");
             return res.status(500).json({ message: "Server configuration error." });
        }

        // jwt.verify() decodes the token, verifies the signature, and checks expiration
        const decodedPayload = jwt.verify(token, secret);

        // 4. Attach decoded user payload to the request object
        // Remember, our payload during login was { user: { id: ..., role: ... } }
        req.user = decodedPayload.user; // Makes req.user.id and req.user.role available to routes
        console.log(`[AuthMiddleware] Token verified successfully for user ID: ${req.user.id}, Role: ${req.user.role}`);

        // 5. Pass control to the next middleware or route handler
        next();

    } catch (error) {
        // Handle specific JWT errors
        console.error('[AuthMiddleware] Token verification failed:', error.name, error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Access denied. Token has expired.' });
        }
        if (error.name === 'JsonWebTokenError') {
             // Covers issues like invalid signature, malformed token, etc.
             return res.status(401).json({ message: 'Access denied. Invalid token.' });
        }
        // Generic error for other issues during verification
        res.status(400).json({ message: 'Token verification failed.' }); // 400 Bad Request might be suitable for malformed tokens
    }
};
