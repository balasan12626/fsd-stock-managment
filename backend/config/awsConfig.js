const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const s3 = new S3Client(config);

const dynamoClient = new DynamoDBClient(config);
const dynamoDB = DynamoDBDocumentClient.from(dynamoClient);

module.exports = { s3, dynamoDB, dynamoDBClient: dynamoClient };
