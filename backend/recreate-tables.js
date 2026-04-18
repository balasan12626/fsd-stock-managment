const { DynamoDBClient, DeleteTableCommand, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const dynamodb = new DynamoDBClient(config);

const tables = [
    {
        TableName: 'Sellers',
        KeySchema: [{ AttributeName: 'sellerId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'sellerId', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Products',
        KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'productId', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Customers',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Carts',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Orders',
        KeySchema: [{ AttributeName: 'orderId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'orderId', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
];

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function deleteTableIfExists(tableName) {
    try {
        await dynamodb.send(new DescribeTableCommand({ TableName: tableName }));
        console.log(`🗑️  Deleting existing table: ${tableName}...`);
        await dynamodb.send(new DeleteTableCommand({ TableName: tableName }));

        // Wait for table to be deleted
        console.log(`⏳ Waiting for ${tableName} to be deleted...`);
        await wait(10000); // Wait 10 seconds
        console.log(`✅ ${tableName} deleted`);
    } catch (err) {
        if (err.name === 'ResourceNotFoundException') {
            console.log(`✅ Table ${tableName} doesn't exist (OK)`);
        } else {
            console.error(`❌ Error checking/deleting ${tableName}:`, err.message);
        }
    }
}

async function recreateTables() {
    console.log('========================================');
    console.log('🔧 TABLE RECREATION SCRIPT');
    console.log('========================================\n');

    // Step 1: Delete existing tables
    console.log('STEP 1: Deleting existing tables...\n');
    for (const table of tables) {
        await deleteTableIfExists(table.TableName);
    }

    console.log('\n⏳ Waiting 5 seconds before creating tables...\n');
    await wait(5000);

    // Step 2: Create tables with correct schema
    console.log('STEP 2: Creating tables with correct schema...\n');
    for (const table of tables) {
        try {
            await dynamodb.send(new CreateTableCommand(table));
            console.log(`✅ Created: ${table.TableName}`);
        } catch (err) {
            if (err.name === 'ResourceInUseException') {
                console.log(`✅ ${table.TableName} already exists`);
            } else {
                console.error(`❌ Error creating ${table.TableName}:`, err.message);
            }
        }
    }

    console.log('\n========================================');
    console.log('✅ TABLE RECREATION COMPLETE!');
    console.log('========================================');
    console.log('\n⚠️  NOTE: All data has been cleared. You will need to:');
    console.log('1. Re-register sellers');
    console.log('2. Re-add products');
    console.log('3. Re-register customers\n');
}

recreateTables().catch(console.error);
