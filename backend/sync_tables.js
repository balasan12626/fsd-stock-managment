const { DynamoDBClient, ListTablesCommand, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const config = {
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const client = new DynamoDBClient(config);

const ensureTable = async (tableName, keySchema, attrDefs) => {
    try {
        const list = await client.send(new ListTablesCommand({}));
        if (list.TableNames.includes(tableName)) {
            console.log(`✅ Table ${tableName} exists.`);
            return;
        }

        console.log(`⏳ Creating table ${tableName}...`);
        await client.send(new CreateTableCommand({
            TableName: tableName,
            KeySchema: keySchema,
            AttributeDefinitions: attrDefs,
            ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
        }));

        // Wait for it to be active
        let status = 'CREATING';
        while (status === 'CREATING') {
            const desc = await client.send(new DescribeTableCommand({ TableName: tableName }));
            status = desc.Table.TableStatus;
            if (status === 'ACTIVE') break;
            console.log(`...waiting for ${tableName} (current status: ${status})`);
            await new Promise(r => setTimeout(r, 2000));
        }
        console.log(`✅ Table ${tableName} is now ACTIVE.`);
    } catch (err) {
        console.error(`❌ Error ensuring table ${tableName}:`, err.message);
    }
};

const run = async () => {
    // Products table should already exist from seller side, but let's check
    await ensureTable('Products',
        [{ AttributeName: 'productId', KeyType: 'HASH' }],
        [{ AttributeName: 'productId', AttributeType: 'S' }]
    );

    // Sellers table should already exist
    await ensureTable('Sellers',
        [{ AttributeName: 'sellerId', KeyType: 'HASH' }],
        [{ AttributeName: 'sellerId', AttributeType: 'S' }]
    );

    // Customers table
    await ensureTable('Customers',
        [{ AttributeName: 'email', KeyType: 'HASH' }],
        [{ AttributeName: 'email', AttributeType: 'S' }]
    );

    // Carts table
    await ensureTable('Carts',
        [{ AttributeName: 'email', KeyType: 'HASH' }],
        [{ AttributeName: 'email', AttributeType: 'S' }]
    );

    console.log('--- ALL TABLES SYNCED ---');
};

run();
