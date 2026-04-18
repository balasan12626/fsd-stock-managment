const { protect, authorize } = require('./authMiddleware');
const { dynamoDB } = require('../config/awsConfig');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Admin authentication middleware
 * Uses unified 'protect' then verifies admin-specific approval status
 */
const adminMiddleware = async (req, res, next) => {
    // 1. Run common protection first
    return protect(req, res, async () => {
        try {
            // 2. Ensure role is admin/superadmin
            if (!['admin', 'superadmin'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Administrator privileges required.'
                });
            }

            // 3. Check approval status in DB
            const params = {
                TableName: 'Admins',
                Key: { adminId: req.user.adminId }
            };

            const result = await dynamoDB.send(new GetCommand(params));

            if (!result.Item) {
                return res.status(401).json({
                    success: false,
                    message: 'Admin account not found.'
                });
            }

            if (result.Item.status !== 'approved') {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your admin account is currently ${result.Item.status || 'pending'}. Please contact super admin.`
                });
            }

            // Attach full admin data for legacy support
            const { password, ...adminData } = result.Item;
            req.admin = adminData;
            req.adminId = req.user.adminId;

            next();
        } catch (error) {
            console.error('Admin check error:', error);
            res.status(500).json({ success: false, message: 'Admin Authorization Failure' });
        }
    });
};

module.exports = adminMiddleware;
