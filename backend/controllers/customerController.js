const { dynamoDB } = require('../config/awsConfig');
const { PutCommand, GetCommand, ScanCommand, UpdateCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { generateToken } = require('../utils/tokenUtils');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// --- Auth ---

const registerCustomer = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`--- REGISTERING CUSTOMER: ${email} ---`);
        if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields (Name, Email, Password) are required' });

        // Email format validation
        if (!email.includes('@')) return res.status(400).json({ success: false, message: 'Invalid email format' });

        // Check availability
        try {
            const checkParams = {
                TableName: 'Customers',
                Key: { email }
            };
            const check = await dynamoDB.send(new GetCommand(checkParams));
            if (check.Item) {
                return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
            }
        } catch (dbErr) {
            console.error('DB Check Error:', dbErr);
            return res.status(500).json({ success: false, message: 'Database connection error during availability check', error: dbErr.message });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const customerId = uuidv4();

        const params = {
            TableName: 'Customers',
            Item: {
                customerId,
                email,
                name,
                password: hashedPassword,
                role: 'customer',
                isVerified: false,
                createdAt: new Date().toISOString()
            }
        };

        await dynamoDB.send(new PutCommand(params));
        console.log('Customer registered successfully');

        const token = generateToken({ customerId, email, role: 'customer' });
        res.status(201).json({ success: true, token, user: { name, email, customerId } });

    } catch (error) {
        console.error('❌ Customer Register Detail Error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Mocking: Just set isVerified to true for any verification request
        await dynamoDB.send(new UpdateCommand({
            TableName: 'Customers',
            Key: { email },
            UpdateExpression: 'set isVerified = :val',
            ExpressionAttributeValues: { ':val': true }
        }));

        res.json({ success: true, message: 'Node synchronization complete: Identity verified.' });
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ message: 'Verification protocol failed' });
    }
};

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`--- LOGGING IN CUSTOMER: ${email} ---`);

        if (!email || !password) return res.status(400).json({ success: false, message: 'Email and Password are required' });

        const params = {
            TableName: 'Customers',
            Key: { email }
        };

        let result;
        try {
            result = await dynamoDB.send(new GetCommand(params));
        } catch (dbErr) {
            console.error('Login DB Error:', dbErr);
            return res.status(500).json({ success: false, message: 'Database connection failed', error: dbErr.message });
        }

        if (!result.Item) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, result.Item.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken({ customerId: result.Item.customerId, email, role: 'customer' });
        console.log('Login successful');
        res.json({ success: true, token, user: { name: result.Item.name, email, customerId: result.Item.customerId } });

    } catch (error) {
        console.error('❌ Customer Login Detail Error:', error);
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

// --- Shop Data ---

const getShopProducts = async (req, res) => {
    try {
        console.log('--- FETCHING SHOP PRODUCTS ---');
        // Fetch all products
        const productsResult = await dynamoDB.send(new ScanCommand({ TableName: 'Products' }));
        const products = productsResult.Items || [];
        console.log(`Found ${products.length} products`);

        // Fetch all sellers for mapping
        const sellersResult = await dynamoDB.send(new ScanCommand({ TableName: 'Sellers' }));
        const sellers = sellersResult.Items || [];
        console.log(`Found ${sellers.length} sellers`);

        // Create a map of sellers by ID
        const sellerMap = sellers.reduce((acc, s) => {
            acc[s.sellerId] = {
                companyName: s.companyName,
                logo: s.logoUrl || s.logo, // handle both naming conventions
                email: s.email,
                phone: s.phone
            };
            return acc;
        }, {});

        // Enrich products with seller details
        const enrichedProducts = products.map(p => ({
            ...p,
            seller: sellerMap[p.sellerId] || { companyName: 'Verified Global Vendor' }
        }));

        res.json(enrichedProducts);
    } catch (error) {
        console.error('❌ Shop Products Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};

const getProductDetails = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(`--- FETCHING PRODUCT DETAILS: ${productId} ---`);

        // 1. Get Product
        const productParams = {
            TableName: 'Products',
            Key: { productId }
        };
        const productResult = await dynamoDB.send(new GetCommand(productParams));

        if (!productResult.Item) {
            console.log('Product not found');
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = productResult.Item;

        // 2. Get Seller (Direct lookup by sellerId)
        const sellerParams = {
            TableName: 'Sellers',
            Key: { sellerId: product.sellerId }
        };
        const sellerResult = await dynamoDB.send(new GetCommand(sellerParams));
        const seller = sellerResult.Item || {};

        res.json({
            ...product,
            seller: {
                name: seller.name || 'Service Representative',
                companyName: seller.companyName || 'Verified Global Vendor',
                email: seller.email,
                phone: seller.phone,
                logo: seller.logoUrl || seller.logo,
                rating: 4.8
            }
        });

    } catch (error) {
        console.error('❌ Product Details Error:', error);
        res.status(500).json({ message: 'Failed to fetch details', error: error.message });
    }
};

// --- Cart ---

const getCart = async (req, res) => {
    try {
        const email = req.user.email;
        const params = {
            TableName: 'Carts',
            Key: { email }
        };
        const result = await dynamoDB.send(new GetCommand(params));
        res.json(result.Item?.items || []);
    } catch (error) {
        res.status(500).json({ message: 'Cart error' });
    }
};

const addToCart = async (req, res) => {
    try {
        const email = req.user.email;
        const { product, quantity } = req.body;

        // Get current cart
        const getParams = { TableName: 'Carts', Key: { email } };
        const data = await dynamoDB.send(new GetCommand(getParams));
        let items = data.Item?.items || [];

        // Check if exists
        const existingIndex = items.findIndex(i => i.productId === product.productId);
        if (existingIndex > -1) {
            items[existingIndex].quantity += quantity;
        } else {
            items.push({ ...product, quantity });
        }

        // Save
        const putParams = {
            TableName: 'Carts',
            Item: { email, items, updatedAt: new Date().toISOString() }
        };
        await dynamoDB.send(new PutCommand(putParams));

        res.json({ success: true, cart: items });
    } catch (error) {
        console.error('Add to Cart Error:', error);
        res.status(500).json({ message: 'Failed to update cart' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const email = req.user.email;
        const { productId } = req.params;

        const getParams = { TableName: 'Carts', Key: { email } };
        const data = await dynamoDB.send(new GetCommand(getParams));
        let items = data.Item?.items || [];

        items = items.filter(i => i.productId !== productId);

        const putParams = {
            TableName: 'Carts',
            Item: { email, items, updatedAt: new Date().toISOString() }
        };
        await dynamoDB.send(new PutCommand(putParams));

        res.json({ success: true, cart: items });
    } catch (error) {
        res.status(500).json({ message: 'Failed to remove item' });
    }
};

const createOrder = async (req, res) => {
    try {
        const { items, paymentMethod, shippingAddress } = req.body;
        const customer = req.user; // from middleware
        const orderId = `ORD-${Date.now()}-${uuidv4().slice(0, 4)}`;

        console.log(`--- INITIATING ORDER PROTOCOL: ${orderId} ---`);

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Logistics error: No items in cargo.' });
        }

        // 1. Fetch all sellers and verify stock
        const sellerIds = [...new Set(items.map(i => i.sellerId))];
        const sellersDetails = {};

        for (const sid of sellerIds) {
            const sRes = await dynamoDB.send(new GetCommand({ TableName: 'Sellers', Key: { sellerId: sid } }));
            sellersDetails[sid] = sRes.Item || { companyName: 'Verified Global Vendor' };
        }

        // 2. Process Inventory Updates (Transaction-like but manual for better control in this schema)
        const enrichedItems = [];
        for (const item of items) {
            // Fetch latest product data to check stock
            // Try simple key first
            let productData;
            try {
                const pRes = await dynamoDB.send(new GetCommand({ TableName: 'Products', Key: { productId: item.productId } }));
                productData = pRes.Item;
            } catch (err) {
                // Fallback to composite key
                const pRes = await dynamoDB.send(new GetCommand({ TableName: 'Products', Key: { sellerId: item.sellerId, productId: item.productId } }));
                productData = pRes.Item;
            }

            if (!productData) {
                return res.status(404).json({ success: false, message: `Asset ${item.productId} lost in matrix.` });
            }

            if (parseInt(productData.quantity) < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${productData.title}. Available: ${productData.quantity}` });
            }

            // Update Product Stock and Sold Quantity
            const updateParams = {
                TableName: 'Products',
                Key: productData.sellerId ? { sellerId: item.sellerId, productId: item.productId } : { productId: item.productId },
                UpdateExpression: 'set #q = #q - :dec, #sq = #sq + :inc',
                ExpressionAttributeNames: { '#q': 'quantity', '#sq': 'soldQuantity' },
                ExpressionAttributeValues: {
                    ':dec': parseInt(item.quantity),
                    ':inc': parseInt(item.quantity)
                }
            };

            // If simple key was actually what worked, we must not provide sellerId in the Key object if it's not the Hash key
            // But usually, updating with both is safer IF it's composite.
            // Let's use a robust update approach similar to productController
            try {
                await dynamoDB.send(new UpdateCommand(updateParams));
            } catch (updErr) {
                // If composite fails, try simple
                await dynamoDB.send(new UpdateCommand({
                    ...updateParams,
                    Key: { productId: item.productId }
                }));
            }

            enrichedItems.push({
                ...item,
                sellerDetail: {
                    companyName: sellersDetails[item.sellerId]?.companyName,
                    email: sellersDetails[item.sellerId]?.email,
                    phone: sellersDetails[item.sellerId]?.phone,
                    logo: sellersDetails[item.sellerId]?.logoUrl || sellersDetails[item.sellerId]?.logo,
                    gstNumber: sellersDetails[item.sellerId]?.gstNumber || '29AAAAA0000A1Z5',
                    address: sellersDetails[item.sellerId]?.address || 'Global Distribution Hub'
                }
            });
        }

        const totalAmount = enrichedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        const orderData = {
            orderId,
            customerId: customer.customerId,
            customerEmail: customer.email,
            customerName: customer.name,
            items: enrichedItems,
            totalAmount,
            paymentMethod,
            shippingAddress,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
        };

        // 3. Save Order
        await dynamoDB.send(new PutCommand({
            TableName: 'Orders',
            Item: orderData
        }));

        // 4. Clear Cart
        await dynamoDB.send(new PutCommand({
            TableName: 'Carts',
            Item: { email: customer.email, items: [], updatedAt: new Date().toISOString() }
        }));

        console.log(`--- ORDER DEPLOYED SUCCESSFULLY: ${orderId} ---`);
        res.status(201).json({ success: true, order: orderData });
    } catch (error) {
        console.error('CRITICAL ORDER FAILURE:', error);
        res.status(500).json({ success: false, message: 'Communication Link Failure: Order not archived.' });
    }
};

const getCustomerOrders = async (req, res) => {
    try {
        const email = req.user.email;
        // Scan is inefficient but for now it works. In production use GSI on customerEmail
        const result = await dynamoDB.send(new ScanCommand({
            TableName: 'Orders',
            FilterExpression: 'customerEmail = :email',
            ExpressionAttributeValues: { ':email': email }
        }));
        res.json(result.Items || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const { sellerId } = req.params;
        // Fetch all orders and filter by sellerId in items
        const result = await dynamoDB.send(new ScanCommand({ TableName: 'Orders' }));
        const allOrders = result.Items || [];

        const sellerOrders = allOrders.filter(order =>
            order.items.some(item => item.sellerId === sellerId)
        ).map(order => ({
            ...order,
            // Only show items belonging to this seller
            items: order.items.filter(item => item.sellerId === sellerId)
        }));

        res.json(sellerOrders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch seller orders' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const result = await dynamoDB.send(new ScanCommand({ TableName: 'Orders' }));
        res.json(result.Items || []);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch all orders' });
    }
};

// --- Reviews/Comments ---

const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log(`--- FETCHING LOGS FOR PRODUCT: ${productId} ---`);

        if (!productId) {
            return res.status(400).json({ message: 'Target ID required for log retrieval.' });
        }

        const params = {
            TableName: 'Reviews',
            KeyConditionExpression: 'productId = :pid',
            ExpressionAttributeValues: { ':pid': productId }
        };

        try {
            const result = await dynamoDB.send(new QueryCommand(params));
            // Sort by date manually as sort key is reviewId
            const reviews = (result.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            console.log(`Found ${reviews.length} logs for unit ${productId}`);
            res.json(reviews);
        } catch (dbError) {
            if (dbError.name === 'ResourceNotFoundException') {
                console.warn(`⚠️  REVIEWS TABLE NOT FOUND: Initializing empty manifest for ${productId}`);
                return res.json([]); // Return empty array if table doesn't exist yet
            }
            throw dbError;
        }
    } catch (error) {
        console.error('❌ Log Retrieval Protocol Failure:', error);
        res.status(500).json({
            message: 'Failed to fetch performance logs',
            error: error.message
        });
    }
};

const addReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { comment, rating } = req.body;
        const user = req.user;

        console.log(`--- BROADCASTING NEW LOG FOR PRODUCT: ${productId} ---`);
        console.log('Operator Context:', { email: user?.email, name: user?.name });

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ message: 'Performance log entry cannot be empty' });
        }

        if (!rating || isNaN(Number(rating))) {
            return res.status(400).json({ message: 'Valid rating status required' });
        }

        const reviewId = `REV-${Date.now()}-${uuidv4().slice(0, 4)}`;
        const reviewData = {
            productId,
            reviewId,
            userId: user.customerId || user.id || 'ANON',
            userName: user.name || 'Anonymous Operator',
            email: user.email,
            comment: comment.trim(),
            rating: Number(rating),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log('Review Data Manifest:', reviewData);

        await dynamoDB.send(new PutCommand({
            TableName: 'Reviews',
            Item: reviewData
        }));

        console.log('Log Synchronized Successfully');
        res.status(201).json({ success: true, review: reviewData });
    } catch (error) {
        console.error('❌ Add Review Execution Error:', error);
        res.status(500).json({
            success: false,
            message: 'Broadcast uplink failure',
            error: error.message
        });
    }
};

const updateReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const { comment, rating } = req.body;
        const user = req.user;

        // Verify ownership
        const getRes = await dynamoDB.send(new GetCommand({
            TableName: 'Reviews',
            Key: { productId, reviewId }
        }));

        if (!getRes.Item) return res.status(404).json({ message: 'Review not found' });
        if (getRes.Item.email !== user.email) return res.status(403).json({ message: 'Unauthorized' });

        const updateParams = {
            TableName: 'Reviews',
            Key: { productId, reviewId },
            UpdateExpression: 'set #c = :comment, #r = :rating, updatedAt = :time',
            ExpressionAttributeNames: { '#c': 'comment', '#r': 'rating' },
            ExpressionAttributeValues: {
                ':comment': comment,
                ':rating': Number(rating),
                ':time': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamoDB.send(new UpdateCommand(updateParams));
        res.json({ success: true, review: result.Attributes });
    } catch (error) {
        console.error('Update Review Error:', error);
        res.status(500).json({ message: 'Failed to update review' });
    }
};

const deleteReview = async (req, res) => {
    try {
        const { productId, reviewId } = req.params;
        const user = req.user;

        // Verify ownership
        const getRes = await dynamoDB.send(new GetCommand({
            TableName: 'Reviews',
            Key: { productId, reviewId }
        }));

        if (!getRes.Item) return res.status(404).json({ message: 'Review not found' });
        if (getRes.Item.email !== user.email && user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await dynamoDB.send(new DeleteCommand({
            TableName: 'Reviews',
            Key: { productId, reviewId }
        }));

        res.json({ success: true, message: 'Review deleted' });
    } catch (error) {
        console.error('Delete Review Error:', error);
        res.status(500).json({ message: 'Failed to delete review' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Allow sellers and admins to update
        if (req.user.role !== 'seller' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Unauthorized execution' });
        }

        const updateParams = {
            TableName: 'Orders',
            Key: { orderId },
            UpdateExpression: 'set #s = :status, updatedAt = :time',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: {
                ':status': status,
                ':time': new Date().toISOString()
            },
            ReturnValues: 'ALL_NEW'
        };

        const result = await dynamoDB.send(new UpdateCommand(updateParams));
        res.json({ success: true, order: result.Attributes });
    } catch (error) {
        console.error('Update Order Status Error:', error);
        res.status(500).json({ message: 'Protocol failure: Order status update failed' });
    }
};

module.exports = {
    registerCustomer,
    loginCustomer,
    getShopProducts,
    getProductDetails,
    getCart,
    addToCart,
    removeFromCart,
    createOrder,
    getCustomerOrders,
    getSellerOrders,
    getAllOrders,
    getReviews,
    addReview,
    updateReview,
    deleteReview,
    updateOrderStatus,
    verifyEmail
};
