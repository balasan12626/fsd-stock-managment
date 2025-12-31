const { v4: uuidv4 } = require('uuid');
const { dynamoDB } = require('../config/awsConfig');
const { PutCommand, UpdateCommand, DeleteCommand, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const addProduct = async (req, res) => {
    try {
        const { title, description, price, quantity, expiryDate } = req.body;
        const sellerId = req.seller.sellerId;
        const imageUrls = req.files ? req.files.map(file => file.location) : [];

        if (!title || !price || !quantity) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const productId = uuidv4();

        const removeEmptyStrings = (obj) => {
            return Object.fromEntries(
                Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            );
        };

        const params = {
            TableNames: 'Products',
            TableName: 'Products',
            Item: removeEmptyStrings({
                sellerId,
                productId,
                title,
                description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                expiryDate,
                imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
                createdAt: new Date().toISOString()
            })
        };

        await dynamoDB.send(new PutCommand(params));
        res.status(201).json({ message: 'Product added successfully', productId });
    } catch (error) {
        console.error('Add Product Error:', error);
        res.status(500).json({ message: 'Backend Link Error', error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { productId, title, description, price, quantity, expiryDate } = req.body;
        const sellerId = req.seller.sellerId;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required for re-deployment' });
        }

        const params = {
            TableName: 'Products',
            Key: { productId },
            UpdateExpression: 'set #t = :t, #d = :d, #p = :p, #q = :q, #e = :e',
            ConditionExpression: 'sellerId = :sid',
            ExpressionAttributeNames: {
                '#t': 'title',
                '#d': 'description',
                '#p': 'price',
                '#q': 'quantity',
                '#e': 'expiryDate'
            },
            ExpressionAttributeValues: {
                ':t': title || '',
                ':d': description || '',
                ':p': parseFloat(price) || 0,
                ':q': parseInt(quantity) || 0,
                ':e': expiryDate || '',
                ':sid': sellerId
            },
            ReturnValues: 'UPDATED_NEW'
        };

        try {
            await dynamoDB.send(new UpdateCommand(params));
            res.json({ message: 'Success: Product unit re-configured and deployed.' });
        } catch (dbError) {
            if (dbError.name === 'ValidationException') {
                await dynamoDB.send(new UpdateCommand({
                    ...params,
                    Key: { sellerId, productId },
                    ConditionExpression: undefined
                }));
                res.json({ message: 'Success: Product unit re-configured (Composite Key Link).' });
            } else {
                throw dbError;
            }
        }
    } catch (error) {
        console.error('Update Controller Error:', error);
        res.status(500).json({ message: 'Core System Error', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params; // Using req.params for maximum reliability
        const sellerId = req.seller.sellerId;

        if (!productId) {
            return res.status(400).json({ message: 'Target ID required for disposal protocol.' });
        }

        console.log(`[DISPOSAL] Initiating disposal of unit ${productId} for seller ${sellerId}`);

        // Try simple key first
        try {
            const params = {
                TableName: 'Products',
                Key: { productId },
                ConditionExpression: 'sellerId = :sid',
                ExpressionAttributeValues: { ':sid': sellerId }
            };
            await dynamoDB.send(new DeleteCommand(params));
            console.log(`[SUCCESS] Unit ${productId} disposed via simple key.`);
            return res.json({ message: 'Success: Product unit disposed.' });
        } catch (dbError) {
            // If simple key fails, try composite key
            if (dbError.name === 'ValidationException' || dbError.name === 'ResourceNotFoundException') {
                console.log(`[FALLBACK] Retrying disposal of unit ${productId} with composite key for ${sellerId}`);
                const compositeParams = {
                    TableName: 'Products',
                    Key: { sellerId, productId }
                };
                await dynamoDB.send(new DeleteCommand(compositeParams));
                console.log(`[SUCCESS] Unit ${productId} disposed via composite key.`);
                return res.json({ message: 'Success: Product unit disposed (Composite Key).' });
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Delete Controller Error:', error);
        res.status(500).json({
            message: 'Disposal Protocol Error: Link unstable.',
            error: error.message
        });
    }
};

const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.seller.sellerId;
        const params = {
            TableName: 'Products',
            FilterExpression: 'sellerId = :sid',
            ExpressionAttributeValues: { ':sid': sellerId }
        };

        const result = await dynamoDB.send(new ScanCommand(params));
        res.json(result.Items);
    } catch (error) {
        console.error('Get Seller Products Error:', error);
        res.status(500).json({ message: 'Communication Link Error', error: error.message });
    }
};

module.exports = { addProduct, updateProduct, deleteProduct, getSellerProducts };
