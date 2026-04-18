const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dynamoDB } = require('../config/awsConfig');
const { ScanCommand, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { generateToken } = require('../utils/tokenUtils');

/**
 * Register a new admin
 * Public route - but should be restricted in production
 */
const registerAdmin = async (req, res) => {
    try {
        console.log('Admin registration request received');
        console.log('Body:', { ...req.body, password: '***' });

        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                required: ['name', 'email', 'password']
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password strength (minimum 6 characters)
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if email already exists in Admins table
        const emailCheckParams = {
            TableName: 'Admins',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email }
        };

        const existingAdmin = await dynamoDB.send(new ScanCommand(emailCheckParams));

        if (existingAdmin.Items && existingAdmin.Items.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered as admin. Please use a different email or login.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const adminId = uuidv4();

        // Super admin email
        const SUPER_ADMIN_EMAIL = 'balasan2626@gmail.com';
        const isAdminApproved = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'approved' : 'pending';

        // Create admin record
        const params = {
            TableName: 'Admins',
            Item: {
                adminId,
                name,
                email,
                password: hashedPassword,
                role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'admin',
                status: isAdminApproved, // New field for approval system
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        await dynamoDB.send(new PutCommand(params));

        const isApproved = isAdminApproved === 'approved';

        // Generate token ONLY if approved (super admin)
        let token = null;
        if (isApproved) {
            token = generateToken({
                adminId,
                email,
                name,
                role: email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'admin'
            });
        }

        // Return success response (excluding password)
        const { password: _, ...adminData } = params.Item;

        res.status(201).json({
            success: true,
            message: isApproved
                ? 'Super Admin registered and approved successfully'
                : 'Admin registration submitted successfully. Your account is pending approval from the super admin (balasan2626@gmail.com).',
            token,
            admin: adminData,
            status: adminData.status
        });
    } catch (error) {
        console.error('Admin registration error:', error);

        let message = 'Server error during admin registration';
        if (error.name === 'ResourceNotFoundException') {
            message = 'Database System Error: "Admins" table not found. Please run the setup script: "node setup-admins-table.js" in the backend folder.';
        }

        res.status(500).json({
            success: false,
            message: message,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Admin login
 * Public route
 */
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Check if admin exists
        const params = {
            TableName: 'Admins',
            FilterExpression: 'email = :email',
            ExpressionAttributeValues: { ':email': email.toLowerCase() }
        };

        const result = await dynamoDB.send(new ScanCommand(params));
        const admin = result.Items?.[0];

        if (!admin) {
            // Check if they are trying the old super admin email and guide them
            const LEGACY_EMAILS = ['sbb502122005@gmail.com', 'sbb202122005@gmail.com'];
            if (LEGACY_EMAILS.includes(email.toLowerCase())) {
                return res.status(401).json({
                    success: false,
                    message: 'Legacy credentials detected. Please use the verified production email: balasan2626@gmail.com'
                });
            }
            return res.status(401).json({ success: false, message: 'Identity not found in administrative records.' });
        }

        // Check approval status
        const SUPER_ADMIN_EMAIL = 'balasan2626@gmail.com';
        if (admin.status !== 'approved') {
            // Failsafe: Auto-approve super admin on first login attempt if they used the correct email
            if (admin.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
                admin.status = 'approved';
                // Update database in background for future
                const updateParams = {
                    TableName: 'Admins',
                    Item: { ...admin, status: 'approved', updatedAt: new Date().toISOString() }
                };
                await dynamoDB.send(new PutCommand(updateParams));
            } else {
                return res.status(403).json({
                    success: false,
                    message: `Your admin account is currently ${admin.status || 'pending'}. Please contact the super admin (balasan2626@gmail.com) for approval.`
                });
            }
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({
            adminId: admin.adminId,
            email: admin.email,
            name: admin.name,
            role: admin.role || 'admin'
        });

        // Return success response (excluding password)
        const { password: _, ...adminData } = admin;

        res.json({
            success: true,
            message: 'Admin login successful',
            token,
            admin: adminData
        });
    } catch (error) {
        console.error('❌ CRITICAL ADMIN LOGIN ERROR:', error);

        let message = 'Uplink Failure: System core unreachable.';
        if (error.name === 'ResourceNotFoundException') {
            message = 'Database Error: "Admins" table decommissioned. Initialize setup.';
        } else if (error.name === 'ValidationException') {
            message = 'Security Protocol Failure: Schema mismatch detected.';
        }

        res.status(500).json({
            success: false,
            message: message,
            error: error.message
        });
    }
};

/**
 * Get current admin profile
 * Requires admin authentication middleware
 */
const getAdminProfile = async (req, res) => {
    try {
        // Admin data is already attached by adminMiddleware
        res.json({
            success: true,
            admin: req.admin
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admin profile',
            error: error.message
        });
    }
};

/**
 * Get all admins for management
 * Super Admin only
 */
const getAllAdmins = async (req, res) => {
    try {
        const SUPER_ADMIN_EMAIL = 'balasan2626@gmail.com';

        // Safety check - though middleware should handle this
        if (req.admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.'
            });
        }

        const params = {
            TableName: 'Admins'
        };

        const result = await dynamoDB.send(new ScanCommand(params));

        // Filter out the super admin itself and exclude passwords
        const admins = (result.Items || [])
            .filter(admin => admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase())
            .map(({ password, ...rest }) => rest);

        res.json({
            success: true,
            admins
        });
    } catch (error) {
        console.error('Get all admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admins',
            error: error.message
        });
    }
};

/**
 * Approve or Decline an admin
 * Super Admin only
 */
const updateAdminStatus = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { status } = req.body; // 'approved' or 'declined'
        const SUPER_ADMIN_EMAIL = 'balasan2626@gmail.com';

        if (req.admin.email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Super admin privileges required.'
            });
        }

        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be "approved" or "declined".'
            });
        }

        // Get existing admin
        const getParams = {
            TableName: 'Admins',
            Key: { adminId }
        };
        const existingResult = await dynamoDB.send(new GetCommand(getParams));

        if (!existingResult.Item) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Update record
        const updateParams = {
            TableName: 'Admins',
            Item: {
                ...existingResult.Item,
                status,
                updatedAt: new Date().toISOString()
            }
        };

        await dynamoDB.send(new PutCommand(updateParams));

        res.json({
            success: true,
            message: `Admin ${status === 'approved' ? 'approved' : 'declined'} successfully`
        });
    } catch (error) {
        console.error('Update admin status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating admin status',
            error: error.message
        });
    }
};

module.exports = { registerAdmin, loginAdmin, getAdminProfile, getAllAdmins, updateAdminStatus };
