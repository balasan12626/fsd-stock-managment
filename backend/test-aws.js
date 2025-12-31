const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
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

console.log('Starting AWS diagnostic test...');

// Set a global timeout
setTimeout(() => {
    console.log('❌ Test timed out after 10 seconds. This usually means a network or credential issue.');
    process.exit(1);
}, 10000);

console.log('1. Testing DynamoDB listTables...');
const runTests = async () => {
    try {
        const data = await dynamodb.send(new ListTablesCommand({}));
        console.log('✅ DynamoDB Connected. Tables:', data.TableNames);
    } catch (err) {
        console.error('❌ DynamoDB Error:', err.message);
    }

    console.log('2. Testing S3 headBucket...');
    const bucketName = process.env.S3_BUCKET_NAME || 'ecommerce-seller-assets';
    try {
        await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
        console.log(`✅ S3 Bucket "${bucketName}" is accessible.`);
    } catch (err) {
        console.error(`❌ S3 Error for bucket "${bucketName}":`, err.message);
    }
};

runTests();
