const { dynamoDB } = require('./config/awsConfig');
require('dotenv').config();
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const fs = require('fs');

const run = async () => {
    try {
        const prod = await dynamoDB.send(new ScanCommand({ TableName: 'Products', Limit: 1 }));
        fs.writeFileSync('debug_prod.json', JSON.stringify(prod.Items, null, 2));

        const cust = await dynamoDB.send(new ScanCommand({ TableName: 'Customers', Limit: 1 }));
        fs.writeFileSync('debug_cust.json', JSON.stringify(cust.Items, null, 2));

        console.log('Done');
    } catch (err) {
        fs.writeFileSync('debug_error.txt', err.stack);
    }
};
run();
