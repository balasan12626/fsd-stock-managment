const { verifyToken } = require('../utils/tokenUtils');
const { dynamoDB } = require('../config/awsConfig');
const { GetCommand } = require('@aws-sdk/lib-dynamodb');

const customerMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);

        if (decoded.role !== 'customer') {
            return res.status(403).json({ message: 'Access denied. Customers only.' });
        }

        // Fetch customer
        // Assuming email is part of decoded token or we look up by ID
        // My Register function: 
        // const token = jwt.sign({ customerId, email, role: 'customer' }...)

        // Since my key is 'email' in Customers table (from registerCustomer logic)
        // I need to use decoded.email.

        const params = {
            TableName: 'Customers',
            Key: { email: decoded.email }
        };

        const result = await dynamoDB.send(new GetCommand(params));
        if (!result.Item) {
            return res.status(401).json({ message: 'Customer not found' });
        }

        req.user = result.Item;
        next();
    } catch (error) {
        console.error('Customer Auth Error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = customerMiddleware;
