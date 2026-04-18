const { DynamoDBClient, ListTablesCommand, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();
const fs = require('fs');

const log = (msg) => {
    const text = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync('sync_log.txt', text);
    console.log(msg);
};

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const tables = [
    {
        TableName: 'Products',
        KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'productId', AttributeType: 'S' }],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    },
    {
        TableName: 'Sellers',
        KeySchema: [{ AttributeName: 'sellerId', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'sellerId', AttributeType: 'S' }],
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

const sync = async () => {
    try {
        log('Starting Table Sync...');
        log(`Using Region: ${process.env.AWS_REGION}`);

        const { TableNames } = await client.send(new ListTablesCommand({}));
        log(`Existing Tables: ${TableNames.join(', ')}`);

        for (const table of tables) {
            if (!TableNames.includes(table.TableName)) {
                log(`Creating Table: ${table.TableName}...`);
                await client.send(new CreateTableCommand(table));
                log(`Successfully initiated creation of ${table.TableName}`);
            } else {
                log(`Table ${table.TableName} already exists.`);
            }
        }

        // Wait for all to be ACTIVE
        log('Waiting for all tables to become ACTIVE...');
        for (const table of tables) {
            let active = false;
            while (!active) {
                const { Table } = await client.send(new DescribeTableCommand({ TableName: table.TableName }));
                if (Table.TableStatus === 'ACTIVE') {
                    active = true;
                    log(`Table ${table.TableName} is now ACTIVE.`);
                } else {
                    log(`Table ${table.TableName} is ${Table.TableStatus}. Waiting 2s...`);
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }
        log('Sync Complete. All tables ACTIVE.');
    } catch (err) {
        log(`ERROR: ${err.message}`);
        log(err.stack);
    }
};

sync();
