const { verifyToken } = require('../utils/tokenUtils');
const { dynamoDB } = require('../config/awsConfig');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

const authMiddleware = async (req, res, next) => {
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

        // Fetch seller details from DynamoDB
        const params = {
            TableName: 'Sellers',
            Key: { sellerId: decoded.sellerId }
        };

        const result = await dynamoDB.send(new GetCommand(params));

        if (!result.Item) {
            return res.status(401).json({
                success: false,
                message: 'Seller not found. Token may be invalid.'
            });
        }

        // Attach seller info to request (excluding password)
        const { password, ...sellerData } = result.Item;
        req.seller = sellerData;
        req.sellerId = decoded.sellerId;

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: `Auth Error: ${error.message}`,
            error: error.message,
            stack: error.stack
        });
    }
};

module.exports = authMiddleware;
