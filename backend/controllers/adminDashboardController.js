const { dynamoDB } = require('../config/awsConfig');
const { ScanCommand, GetCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Get all products with seller details
 * Admin only - shows all products from all sellers
 */
const getAllProducts = async (req, res) => {
    try {
        // Fetch all products
        const productsParams = {
            TableName: 'Products'
        };

        const productsResult = await dynamoDB.send(new ScanCommand(productsParams));
        const products = productsResult.Items || [];

        // Fetch all sellers to join with products
        const sellersParams = {
            TableName: 'Sellers'
        };

        const sellersResult = await dynamoDB.send(new ScanCommand(sellersParams));
        const sellers = sellersResult.Items || [];

        // Create a map of sellers by sellerId for quick lookup
        const sellersMap = {};
        sellers.forEach(seller => {
            const { password, ...sellerData } = seller; // Exclude password
            sellersMap[seller.sellerId] = sellerData;
        });

        // Join products with seller information
        const productsWithSellers = products.map(product => {
            const seller = sellersMap[product.sellerId] || null;
            return {
                ...product,
                seller: seller ? {
                    sellerId: seller.sellerId,
                    companyName: seller.companyName,
                    email: seller.email,
                    phone: seller.phone,
                    logoUrl: seller.logoUrl,
                    gstNumber: seller.gstNumber,
                    address: seller.address
                } : null
            };
        });

        res.json({
            success: true,
            count: productsWithSellers.length,
            products: productsWithSellers
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

/**
 * Get all sellers with complete information
 * Admin only
 */
const getAllSellers = async (req, res) => {
    try {
        // Fetch all sellers
        const sellersParams = {
            TableName: 'Sellers'
        };

        const sellersResult = await dynamoDB.send(new ScanCommand(sellersParams));
        const sellers = sellersResult.Items || [];

        // Fetch all products to count products per seller
        const productsParams = {
            TableName: 'Products'
        };

        const productsResult = await dynamoDB.send(new ScanCommand(productsParams));
        const products = productsResult.Items || [];

        // Count products per seller
        const productCountMap = {};
        products.forEach(product => {
            productCountMap[product.sellerId] = (productCountMap[product.sellerId] || 0) + 1;
        });

        // Add product count and exclude password from sellers
        const sellersWithDetails = sellers.map(seller => {
            const { password, ...sellerData } = seller;
            return {
                ...sellerData,
                productCount: productCountMap[seller.sellerId] || 0
            };
        });

        res.json({
            success: true,
            count: sellersWithDetails.length,
            sellers: sellersWithDetails
        });
    } catch (error) {
        console.error('Get all sellers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sellers',
            error: error.message
        });
    }
};

/**
 * Get specific product with seller details
 * Admin only
 */
const getProductWithSeller = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Fetch product
        const productParams = {
            TableName: 'Products',
            Key: { productId }
        };

        const productResult = await dynamoDB.send(new GetCommand(productParams));
        const product = productResult.Item;

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Fetch seller details
        const sellerParams = {
            TableName: 'Sellers',
            Key: { sellerId: product.sellerId }
        };

        const sellerResult = await dynamoDB.send(new GetCommand(sellerParams));
        const seller = sellerResult.Item;

        // Exclude password from seller data
        const { password, ...sellerData } = seller || {};

        res.json({
            success: true,
            product: {
                ...product,
                seller: seller ? sellerData : null
            }
        });
    } catch (error) {
        console.error('Get product with seller error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product details',
            error: error.message
        });
    }
};

/**
 * Get dashboard statistics
 * Admin only
 */
const getDashboardStats = async (req, res) => {
    try {
        // Fetch all products
        const productsParams = {
            TableName: 'Products'
        };
        const productsResult = await dynamoDB.send(new ScanCommand(productsParams));
        const products = productsResult.Items || [];

        // Fetch all sellers
        const sellersParams = {
            TableName: 'Sellers'
        };
        const sellersResult = await dynamoDB.send(new ScanCommand(sellersParams));
        const sellers = sellersResult.Items || [];

        // Calculate statistics
        const totalProducts = products.length;
        const totalSellers = sellers.length;
        const totalInventoryValue = products.reduce((sum, product) => {
            return sum + (product.price * product.quantity);
        }, 0);
        const totalQuantity = products.reduce((sum, product) => {
            return sum + product.quantity;
        }, 0);

        res.json({
            success: true,
            stats: {
                totalProducts,
                totalSellers,
                totalInventoryValue: totalInventoryValue.toFixed(2),
                totalQuantity,
                averageProductsPerSeller: totalSellers > 0 ? (totalProducts / totalSellers).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

/**
 * Delete a product (admin privilege)
 * Admin only
 */
const deleteProductAsAdmin = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        console.log(`[ADMIN DELETE] Admin ${req.adminId} deleting product ${productId}`);

        // Try simple key first
        try {
            const params = {
                TableName: 'Products',
                Key: { productId }
            };
            await dynamoDB.send(new DeleteCommand(params));
            console.log(`[SUCCESS] Product ${productId} deleted by admin.`);
            return res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (dbError) {
            // If simple key fails, try with composite key
            if (dbError.name === 'ValidationException') {
                // Need to get the product first to find sellerId
                const getParams = {
                    TableName: 'Products',
                    FilterExpression: 'productId = :pid',
                    ExpressionAttributeValues: { ':pid': productId }
                };
                const result = await dynamoDB.send(new ScanCommand(getParams));

                if (result.Items && result.Items.length > 0) {
                    const product = result.Items[0];
                    const compositeParams = {
                        TableName: 'Products',
                        Key: { sellerId: product.sellerId, productId }
                    };
                    await dynamoDB.send(new DeleteCommand(compositeParams));
                    console.log(`[SUCCESS] Product ${productId} deleted via composite key.`);
                    return res.json({
                        success: true,
                        message: 'Product deleted successfully'
                    });
                }
            }
            throw dbError;
        }
    } catch (error) {
        console.error('Admin delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

module.exports = {
    getAllProducts,
    getAllSellers,
    getProductWithSeller,
    getDashboardStats,
    deleteProductAsAdmin
};
