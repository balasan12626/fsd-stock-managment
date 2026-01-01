const { S3Client, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const dynamodb = new DynamoDBClient(config);
const s3 = new S3Client(config);

const tables = [
    {
        TableName: 'Sellers',
        KeySchema: [{ AttributeName: 'sellerId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'sellerId', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Products',
        KeySchema: [
            { AttributeName: 'sellerId', KeyType: 'HASH' },
            { AttributeName: 'productId', KeyType: 'RANGE' }
        ],
        AttributeDefinitions: [
            { AttributeName: 'sellerId', AttributeType: 'S' },
            { AttributeName: 'productId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Transactions',
        KeySchema: [{ AttributeName: 'transactionId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'transactionId', AttributeType: 'S' },
            { AttributeName: 'sellerId', AttributeType: 'S' }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: 'SellerTransactionsIndex',
                KeySchema: [
                    { AttributeName: 'sellerId', KeyType: 'HASH' },
                    { AttributeName: 'transactionId', KeyType: 'RANGE' }
                ],
                Projection: { ProjectionType: 'ALL' },
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    }
];

async function setupAWS() {
    console.log('--- Starting AWS Setup ---');

    // 1. Setup DynamoDB Tables
    console.log('\n1. Setting up DynamoDB Tables...');
    for (const table of tables) {
        try {
            await dynamodb.send(new CreateTableCommand(table));
            console.log(`✅ Table "${table.TableName}" created successfully!`);
        } catch (err) {
            if (err.name === 'ResourceInUseException') {
                console.log(`✅ Table "${table.TableName}" already exists.`);
            } else {
                console.error(`❌ Error creating table "${table.TableName}":`, err.message);
            }
        }
    }

    // 2. Verify S3 Bucket
    console.log('\n2. Verifying S3 Bucket...');
    const bucketName = process.env.S3_BUCKET_NAME || 'ecommerce-seller-assets';
    try {
        await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`✅ S3 Bucket "${bucketName}" is accessible.`);
    } catch (err) {
        if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
            console.log(`❌ S3 Bucket "${bucketName}" not found. Attempting to create...`);
            try {
                await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
                console.log(`✅ S3 Bucket "${bucketName}" created successfully!`);
            } catch (createErr) {
                console.error(`❌ Error creating bucket:`, createErr.message);
                console.log('💡 Tip: S3 bucket names must be globally unique. Try changing S3_BUCKET_NAME in .env');
            }
        } else {
            console.error(`❌ S3 Error:`, err.message);
        }
    }

    console.log('\n--- AWS Setup Complete ---');
}

setupAWS();
