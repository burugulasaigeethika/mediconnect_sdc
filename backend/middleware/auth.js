const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const { isTokenBlacklisted } = require('../services/tokenBlacklistService');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Check if token is blacklisted (logged out)
        const blacklisted = await isTokenBlacklisted(token);
        if (blacklisted) {
            return res.status(401).json({ message: 'Token has been revoked. Please login again.' });
        }

        // Verify token
        const secret = config.jwtSecret;
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        req.token = token; // Store token for logout
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired. Please login again.' });
        }
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log(`Authorize middleware called for ${req.originalUrl}`);
        console.log(`Required roles: ${roles.join(', ')} `);

        if (!req.user || !req.user.role) {
            console.log('Access denied: No user or role in request');
            return res.status(403).json({
                message: 'Access denied: User role not found in token',
                receivedRole: req.user?.role || 'none',
                requiredRoles: roles
            });
        }

        console.log(`User role from token: ${req.user.role} `);

        if (!roles.includes(req.user.role)) {
            console.log(`Access denied: Role ${req.user.role} is not in [${roles.join(', ')}]`);
            return res.status(403).json({
                message: 'Access denied: Insufficient permissions',
                receivedRole: req.user.role,
                requiredRoles: roles
            });
        }

        console.log('Authorization successful');
        next();
    };
};

module.exports = { authMiddleware, authorize, protect: authMiddleware };
