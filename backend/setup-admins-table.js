const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

console.log('Environment Check:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not Set');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const dynamoDB = DynamoDBDocumentClient.from(client);

async function setupAdminsTable() {
    const tableName = 'Admins';

    try {
        console.log(`\n--- Starting Setup for ${tableName} ---`);

        // Check if table exists
        console.log(`Checking if ${tableName} table exists...`);
        try {
            const tableInfo = await client.send(new DescribeTableCommand({ TableName: tableName }));
            console.log(`✅ ${tableName} table already exists. Status: ${tableInfo.Table.TableStatus}`);
        } catch (error) {
            if (error.name === 'ResourceNotFoundException') {
                // Create table
                console.log(`Creating ${tableName} table...`);
                const createTableParams = {
                    TableName: tableName,
                    KeySchema: [
                        { AttributeName: 'adminId', KeyType: 'HASH' }
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'adminId', AttributeType: 'S' }
                    ],
                    BillingMode: 'PAY_PER_REQUEST'
                };

                const createResult = await client.send(new CreateTableCommand(createTableParams));
                console.log(`✅ Table creation initiated. Status: ${createResult.TableDescription.TableStatus}`);

                // Wait for table to be active
                console.log('Waiting for table to be active (this can take up to 20 seconds)...');
                let active = false;
                for (let i = 0; i < 10; i++) {
                    const statusCheck = await client.send(new DescribeTableCommand({ TableName: tableName }));
                    if (statusCheck.Table.TableStatus === 'ACTIVE') {
                        active = true;
                        break;
                    }
                    console.log(`Still waiting... (Current Status: ${statusCheck.Table.TableStatus})`);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }

                if (active) {
                    console.log(`✅ ${tableName} table is now ACTIVE.`);
                } else {
                    console.log(`⚠️ Table is not active yet, but proceeding anyway.`);
                }
            } else {
                console.error(`❌ Unexpected error checking table existence:`, error);
                throw error;
            }
        }

        // Create Super Admin account
        console.log('\nCreating Super Admin account...');
        const superAdmin = {
            adminId: uuidv4(),
            name: 'Super Admin',
            email: 'balasan2626@gmail.com',
            password: await bcrypt.hash('bala2005', 12),
            role: 'superadmin',
            status: 'approved',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamoDB.send(new PutCommand({
            TableName: tableName,
            Item: superAdmin,
            ConditionExpression: 'attribute_not_exists(email)'
        }));

        console.log('✅ Super Admin account created successfully!');
        console.log('\n📧 Production Admin Credentials:');
        console.log('   Email: balasan2626@gmail.com');
        console.log('   Password: bala2005');

    } catch (error) {
        if (error.name === 'ConditionalCheckFailedException') {
            console.log('ℹ️  Default admin account already exists.');
        } else {
            console.error('❌ Error during setup:', error);
            throw error;
        }
    }
}

console.log('Script started...');
setupAdminsTable()
    .then(() => {
        console.log('\n✅ Admin table setup process finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Setup process failed with error.');
        process.exit(1);
    });

