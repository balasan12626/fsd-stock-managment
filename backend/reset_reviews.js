const { CreateTableCommand, DeleteTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { dynamoDBClient } = require('./config/awsConfig');

const resetReviewsTable = async () => {
    try {
        console.log('Checking for existing Reviews table...');
        const list = await dynamoDBClient.send(new ListTablesCommand({}));
        const existingTables = list.TableNames || [];

        if (existingTables.includes('Reviews')) {
            console.log('Deleting existing Reviews table...');
            await dynamoDBClient.send(new DeleteTableCommand({ TableName: 'Reviews' }));
            console.log('Table deleted. Waiting for deletion to propagate...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        console.log('Creating fresh Reviews table...');
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
            ProvisionedThroughput: { ReadCapacityUnits: 10, WriteCapacityUnits: 10 }
        }));
        console.log('Reviews table created successfully.');
    } catch (e) {
        console.error('Failed to reset Reviews table:', e);
    }
};

resetReviewsTable();
