const { dynamoDB } = require('./config/awsConfig');
const { ListTablesCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const test = async () => {
    console.log('--- AWS CONFIG TEST ---');
    console.log('REGION:', process.env.AWS_REGION);
    console.log('ACCESS KEY ID:', process.env.AWS_ACCESS_KEY_ID ? 'EXISTS' : 'MISSING');

    try {
        console.log('Listing tables...');
        const list = await dynamoDB.send(new ListTablesCommand({}));
        console.log('TABLES:', list.TableNames);

        if (list.TableNames.includes('Customers')) {
            console.log('Testing GetCommand on Customers...');
            await dynamoDB.send(new GetCommand({
                TableName: 'Customers',
                Key: { email: 'test@example.com' }
            }));
            console.log('GetCommand SUCCESS');
        } else {
            console.log('Customers table MISSING');
        }
    } catch (err) {
        console.error('--- AWS TEST ERROR ---');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
    }
};

test();
