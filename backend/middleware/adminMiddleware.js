const { verifyToken } = require('../utils/tokenUtils');
const { dynamoDB } = require('../config/awsConfig');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Admin authentication middleware
 * Verifies JWT token and ensures user has admin role
 */
const adminMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.header('Authorization');

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authorization header provided.'
            });
        }

        // Check if header starts with 'Bearer '
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization format. Use: Bearer <token>'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token using utility function
        let decoded;
        try {
            decoded = verifyToken(token);
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || 'Token verification failed'
            });
        }

        // Check if the token has correct role
        if (!['admin', 'superadmin'].includes(decoded.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Administrator privileges required.'
            });
        }

        // Fetch admin details from DynamoDB
        const params = {
            TableName: 'Admins',
            Key: { adminId: decoded.adminId }
        };

        const result = await dynamoDB.send(new GetCommand(params));

        if (!result.Item) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found. Token may be invalid.'
            });
        }

        // Verify role in database as well
        if (!['admin', 'superadmin'].includes(result.Item.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Administrator privileges required.'
            });
        }

        // Check approval status
        if (result.Item.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: `Access denied. Your admin account is currently ${result.Item.status || 'pending'}. Please contact the super admin (sbb502122005@gmail.com) for approval.`
            });
        }

        // Attach admin info to request (excluding password)
        const { password, ...adminData } = result.Item;
        req.admin = adminData;
        req.adminId = decoded.adminId;

        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: `Admin Auth Error: ${error.message}`,
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = adminMiddleware;
