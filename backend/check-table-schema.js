const { DynamoDBClient, DescribeTableCommand, DeleteTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const client = new DynamoDBClient(config);

async function checkTable() {
    console.log('Checking Products table schema...');
    try {
        const command = new DescribeTableCommand({ TableName: 'Products' });
        const response = await client.send(command);
        const keySchema = response.Table.KeySchema;
        console.log('Current Key Schema:', JSON.stringify(keySchema, null, 2));

        const hasSellerIdHash = keySchema.some(k => k.AttributeName === 'sellerId' && k.KeyType === 'HASH');
        const hasProductIdRange = keySchema.some(k => k.AttributeName === 'productId' && k.KeyType === 'RANGE');

        if (!hasSellerIdHash || !hasProductIdRange) {
            console.log('❌ Schema is INCORRECT. It should be sellerId (HASH) and productId (RANGE).');
            console.log('⚠️ Deleting table to allow recreation with correct schema...');

            await client.send(new DeleteTableCommand({ TableName: 'Products' }));
            console.log('✅ Table deleted. Please run "npm run setup-aws" or restart the server to recreate it.');
        } else {
            console.log('✅ Schema is CORRECT.');
        }

    } catch (err) {
        console.error('Error describing table:', err.message);
    }
}

checkTable();
