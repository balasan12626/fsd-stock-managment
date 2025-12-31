# AWS DynamoDB Access Patterns

## Sellers Table

**Partition Key:** `sellerId` (String)

### Access Patterns

1. **Get Seller by ID**
   ```javascript
   const params = {
     TableName: 'Sellers',
     Key: { sellerId: 'uuid-here' }
   };
   await dynamoDB.get(params).promise();
   ```

2. **Find Seller by Email (Login)**
   ```javascript
   const params = {
     TableName: 'Sellers',
     FilterExpression: 'email = :email',
     ExpressionAttributeValues: { ':email': 'seller@example.com' }
   };
   await dynamoDB.scan(params).promise();
   ```

## Products Table

**Partition Key:** `sellerId` (String)
**Sort Key:** `productId` (String)

### Access Patterns

1. **Get All Products for a Seller**
   ```javascript
   const params = {
     TableName: 'Products',
     KeyConditionExpression: 'sellerId = :sid',
     ExpressionAttributeValues: { ':sid': 'seller-uuid' }
   };
   await dynamoDB.query(params).promise();
   ```

2. **Get Specific Product**
   ```javascript
   const params = {
     TableName: 'Products',
     Key: {
       sellerId: 'seller-uuid',
       productId: 'product-uuid'
     }
   };
   await dynamoDB.get(params).promise();
   ```

3. **Update Product**
   ```javascript
   const params = {
     TableName: 'Products',
     Key: { sellerId: 'seller-uuid', productId: 'product-uuid' },
     UpdateExpression: 'set title = :t, price = :p, quantity = :q',
     ExpressionAttributeValues: {
       ':t': 'New Title',
       ':p': 99.99,
       ':q': 100
     }
   };
   await dynamoDB.update(params).promise();
   ```

4. **Delete Product**
   ```javascript
   const params = {
     TableName: 'Products',
     Key: {
       sellerId: 'seller-uuid',
       productId: 'product-uuid'
     }
   };
   await dynamoDB.delete(params).promise();
   ```

## Best Practices

- Use Query instead of Scan when possible for better performance
- Implement pagination for large result sets
- Use conditional writes to prevent race conditions
- Consider adding GSI (Global Secondary Index) for email lookups on Sellers table
- Monitor read/write capacity units and adjust as needed
