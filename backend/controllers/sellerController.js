const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dynamoDB } = require('../config/awsConfig');
const { ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { generateToken } = require('../utils/tokenUtils');

const registerSeller = async (req, res) => {
    try {
        console.log('Registration request received');
        console.log('Body:', { ...req.body, password: '***' });
        console.log('File:', req.file);

        const { companyName, gstNumber, email, phone, address, password } = req.body;
        const logoUrl = req.file ? req.file.location : null;

        // Validate required fields
        if (!companyName || !gstNumber || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['companyName', 'gstNumber', 'email', 'password']
            });
        }

        // Check if email already exists
        const emailCheckParams = {
            TableName: 'Sellers',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        const existingUser = await dynamoDB.send(new ScanCommand(emailCheckParams));

        if (existingUser.Items && existingUser.Items.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered. Please use a different email or login.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const sellerId = uuidv4();

        // Helper to remove empty strings
        const removeEmptyStrings = (obj) => {
            return Object.fromEntries(
                Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
            );
        };

        // Create seller record
        const params = {
            TableName: 'Sellers',
            Item: removeEmptyStrings({
                sellerId,
                companyName,
                gstNumber,
                email,
                phone,
                address,
                password: hashedPassword,
                logoUrl,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
        };

        await dynamoDB.send(new PutCommand(params));

        // Generate JWT token
        const token = generateToken({
            sellerId,
            email,
            companyName
        });

        // Return success response (excluding password)
        const { password: _, ...sellerData } = params.Item;

        res.status(201).json({
            success: true,
            message: 'Seller registered successfully',
            token,
            seller: sellerData
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message,
            stack: error.stack
        });
    }
};

const loginSeller = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find seller by email
        const params = {
            TableName: 'Sellers',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        const result = await dynamoDB.send(new ScanCommand(params));
        const seller = result.Items ? result.Items[0] : null;

        // Check if seller exists
        if (!seller) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, seller.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({
            sellerId: seller.sellerId,
            email: seller.email,
            companyName: seller.companyName
        });

        // Return success response (excluding password)
        const { password: _, ...sellerData } = seller;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            seller: sellerData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};


/**
 * Get current seller profile
 * Requires authentication middleware
 */
const getSellerProfile = async (req, res) => {
    try {
        // Seller data is already attached by authMiddleware
        res.json({
            success: true,
            seller: req.seller
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: error.message
        });
    }
};

/**
 * Refresh JWT token
 * Requires authentication middleware
 */
const refreshToken = async (req, res) => {
    try {
        // Generate new token with same payload
        const newToken = generateToken({
            sellerId: req.seller.sellerId,
            email: req.seller.email,
            companyName: req.seller.companyName
        });

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            token: newToken
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while refreshing token',
            error: error.message
        });
    }
};

module.exports = { registerSeller, loginSeller, getSellerProfile, refreshToken };
