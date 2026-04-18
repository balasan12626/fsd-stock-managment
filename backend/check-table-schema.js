const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function check() {
    try {
        const data = await client.send(new DescribeTableCommand({ TableName: 'Products' }));
        console.log('--- PRODUCTS TABLE SCHEMA ---');
        console.log(JSON.stringify(data.Table.KeySchema, null, 2));

        const data2 = await client.send(new DescribeTableCommand({ TableName: 'Sellers' }));
        console.log('--- SELLERS TABLE SCHEMA ---');
        console.log(JSON.stringify(data2.Table.KeySchema, null, 2));
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

check();
