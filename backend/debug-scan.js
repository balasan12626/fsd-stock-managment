const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function scan() {
    try {
        const data = await client.send(new ScanCommand({ TableName: 'Products', Limit: 10 }));
        console.log(JSON.stringify(data.Items, null, 2));
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}

scan();
