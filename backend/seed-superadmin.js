const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { dynamoDB } = require('./config/awsConfig');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const seedSuperAdmin = async () => {
    const email = 'balasan2626@gmail.com';
    const password = 'bala2005';
    const name = 'Super Admin';
    const adminId = uuidv4();

    try {
        console.log(`[SEED] Initializing Super Admin: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);

        const params = {
            TableName: 'Admins',
            Item: {
                adminId,
                name,
                email,
                password: hashedPassword,
                role: 'superadmin',
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        };

        await dynamoDB.send(new PutCommand(params));
        console.log('✅ PROTOCOL COMPLETE: Super Admin stored successfully in DynamoDB.');
        process.exit(0);
    } catch (error) {
        console.error('❌ CRITICAL SEED FAILURE:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
