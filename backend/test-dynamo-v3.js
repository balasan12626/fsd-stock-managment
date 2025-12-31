const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const dynamoClient = new DynamoDBClient(config);
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

async function testDynamoDB() {
    console.log('Testing DynamoDB Connection...');
    try {
        // 1. Test Scan
        console.log('1. Testing Scan on Sellers table...');
        const scanResult = await dynamoDB.send(new ScanCommand({ TableName: 'Sellers', Limit: 1 }));
        console.log('✅ Scan successful. Items found:', scanResult.Items.length);

        if (scanResult.Items.length > 0) {
            const sellerId = scanResult.Items[0].sellerId;
            console.log('2. Testing GetItem for sellerId:', sellerId);

            const getResult = await dynamoDB.send(new GetCommand({
                TableName: 'Sellers',
                Key: { sellerId: sellerId }
            }));

            if (getResult.Item) {
                console.log('✅ GetItem successful.');
            } else {
                console.log('❌ GetItem returned no item (unexpected).');
            }
        } else {
            console.log('⚠️ No sellers found to test GetItem.');
        }

    } catch (err) {
        console.error('❌ DynamoDB Error:', err);
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
    }
}

testDynamoDB();
