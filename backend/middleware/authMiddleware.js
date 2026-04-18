const { verifyToken } = require('../utils/tokenUtils');
const { dynamoDB } = require('../config/awsConfig');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Unified authentication middleware
 * Verifies JWT and attaches decoded user to req.user
 */
const protect = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Valid authorization token required.'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        
        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            
            // For legacy compatibility where code expects req.sellerId or req.adminId
            if (decoded.role === 'seller') {
                req.sellerId = decoded.sellerId;
            } else if (decoded.role === 'admin' || decoded.role === 'superadmin') {
                req.adminId = decoded.adminId;
            } else if (decoded.role === 'customer') {
                req.customerId = decoded.customerId;
            }

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Session expired or invalid. Please login again.',
                error: err.message
            });
        }
    } catch (error) {
        console.error('Protect middleware error:', error);
        res.status(500).json({ success: false, message: 'Internal Authentication Error' });
    }
};

/**
 * Role-based access control middleware
 * usage: authorize('admin', 'seller')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.warn(`[SECURITY] Unauthorized access attempt by ${req.user?.role || 'anonymous'} to ${req.originalUrl}`);
            return res.status(403).json({
                success: false,
                message: `Access denied. ${roles.join(' or ').toUpperCase()} privileges required.`
            });
        }
        next();
    };
};

// Export both for flexible use
module.exports = { protect, authorize };
