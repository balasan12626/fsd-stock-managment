const { CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { dynamoDBClient } = require('./config/awsConfig');

const createTables = async () => {
    try {
        const list = await dynamoDBClient.send(new ListTablesCommand({}));
        const existingTables = list.TableNames || [];

        // 1. Customers Table
        if (!existingTables.includes('Customers')) {
            console.log('Creating Customers Table...');
            await dynamoDBClient.send(new CreateTableCommand({
                TableName: 'Customers',
                KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
                AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }));
            console.log('Customers Table Created.');
        } else {
            console.log('Customers Table already exists.');
        }

        // 2. Carts Table
        if (!existingTables.includes('Carts')) {
            console.log('Creating Carts Table...');
            await dynamoDBClient.send(new CreateTableCommand({
                TableName: 'Carts',
                KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
                AttributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }));
            console.log('Carts Table Created.');
        } else {
            console.log('Carts Table already exists.');
        }

        // 3. Reviews Table
        if (!existingTables.includes('Reviews')) {
            console.log('Creating Reviews Table...');
            await dynamoDBClient.send(new CreateTableCommand({
                TableName: 'Reviews',
                KeySchema: [
                    { AttributeName: 'productId', KeyType: 'HASH' },
                    { AttributeName: 'reviewId', KeyType: 'RANGE' }
                ],
                AttributeDefinitions: [
                    { AttributeName: 'productId', AttributeType: 'S' },
                    { AttributeName: 'reviewId', AttributeType: 'S' }
                ],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }));
            console.log('Reviews Table Created.');
        } else {
            console.log('Reviews Table already exists.');
        }

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

createTables().then(() => {
    console.log("Initialization Complete.");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
