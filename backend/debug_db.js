const { dynamoDB } = require('./config/awsConfig');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');

const debugDB = async () => {
    try {
        const prod = await dynamoDB.send(new ScanCommand({ TableName: 'Products' }));
        console.log('PRODUCTS COUNT:', prod.Items?.length || 0);
        if (prod.Items && prod.Items.length > 0) {
            console.log('FIRST PRODUCT:', JSON.stringify(prod.Items[0], null, 2));
        }

        const sell = await dynamoDB.send(new ScanCommand({ TableName: 'Sellers' }));
        console.log('SELLERS COUNT:', sell.Items?.length || 0);
        if (sell.Items && sell.Items.length > 0) {
            console.log('FIRST SELLER:', JSON.stringify(sell.Items[0], null, 2));
        }

        const cust = await dynamoDB.send(new ScanCommand({ TableName: 'Customers' }));
        console.log('CUSTOMERS COUNT:', cust.Items?.length || 0);

    } catch (err) {
        console.error('DEBUG ERROR:', err);
    }
};

debugDB();
