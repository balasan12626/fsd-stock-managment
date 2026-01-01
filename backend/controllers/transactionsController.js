const { v4: uuidv4 } = require('uuid');
const { dynamoDB } = require('../config/awsConfig');
const { PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Log a new transaction
 * @param {Object} data - { sellerId, productId, type, quantity, reason }
 */
const logTransaction = async (data) => {
    try {
        const { sellerId, productId, type, quantity, reason } = data;

        const transactionId = uuidv4();
        const timestamp = new Date().toISOString();

        const params = {
            TableName: 'Transactions',
            Item: {
                transactionId,
                sellerId,
                productId,
                type, // 'add', 'remove', 'update', 'initial_stock'
                quantity: parseInt(quantity),
                reason: reason || 'N/A',
                timestamp
            }
        };

        await dynamoDB.send(new PutCommand(params));
        console.log(`[TRANSACTION] Logged ${type} for product ${productId}`);
        return { success: true, transactionId };
    } catch (error) {
        console.error('Log Transaction Error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Handle manual transaction request (POST /api/transactions)
 */
const postTransaction = async (req, res) => {
    try {
        const { productId, type, quantity, reason } = req.body;
        const sellerId = req.seller.sellerId;

        if (!productId || !type || quantity === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required transaction fields.' });
        }

        const result = await logTransaction({
            sellerId,
            productId,
            type,
            quantity,
            reason
        });

        if (result.success) {
            res.json({ success: true, message: 'Transaction logged successfully.', transactionId: result.transactionId });
        } else {
            res.status(500).json({ success: false, message: 'Failed to log transaction.', error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

/**
 * Get transactions for a specific seller
 */
const getSellerTransactions = async (req, res) => {
    try {
        const sellerId = req.seller.sellerId;

        const params = {
            TableName: 'Transactions',
            IndexName: 'SellerTransactionsIndex',
            KeyConditionExpression: 'sellerId = :sid',
            ExpressionAttributeValues: {
                ':sid': sellerId
            },
            ScanIndexForward: false // Newest first
        };

        const result = await dynamoDB.send(new QueryCommand(params));
        res.json({
            success: true,
            transactions: result.Items
        });
    } catch (error) {
        console.error('Get Seller Transactions Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch transaction history.',
            error: error.message
        });
    }
};

module.exports = { logTransaction, getSellerTransactions, postTransaction };
