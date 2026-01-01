const { dynamoDB } = require('../config/awsConfig');
const { ScanCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

/**
 * Get Comprehensive Seller Performance Report
 * Restricted to Admins & SuperAdmins via middleware
 */
const getSellerPerformanceReport = async (req, res) => {
    try {
        // 1. Fetch all sellers
        const sellersResult = await dynamoDB.send(new ScanCommand({ TableName: 'Sellers' }));
        const sellers = sellersResult.Items || [];

        // 2. Fetch all products
        const productsResult = await dynamoDB.send(new ScanCommand({ TableName: 'Products' }));
        const products = productsResult.Items || [];

        // 3. Process data
        const sellerPerformance = sellers.map(seller => {
            const sellerProducts = products.filter(p => p.sellerId === seller.sellerId);

            const totalProductsSold = sellerProducts.length;
            const totalSalesQuantity = sellerProducts.reduce((sum, p) => sum + (p.soldQuantity || 0), 0);
            const totalRevenue = sellerProducts.reduce((sum, p) => sum + ((p.soldQuantity || 0) * (p.price || 0)), 0);

            return {
                sellerId: seller.sellerId,
                name: seller.name,
                companyName: seller.companyName,
                logo: seller.logo,
                email: seller.email,
                phone: seller.phone,
                totalProducts: sellerProducts.length,
                totalProductsSold,
                totalSalesQuantity,
                totalRevenue,
                products: sellerProducts.map(p => ({
                    productId: p.productId,
                    title: p.title,
                    description: p.description,
                    category: p.category || 'General',
                    price: p.price,
                    quantity: p.quantity,
                    soldQuantity: p.soldQuantity || 0,
                    revenue: (p.soldQuantity || 0) * (p.price || 0),
                    expiryDate: p.expiryDate,
                    isExpired: p.expiryDate ? new Date(p.expiryDate) < new Date() : false
                }))
            };
        });

        // 4. Rank sellers by revenue
        const rankedSellers = [...sellerPerformance].sort((a, b) => b.totalRevenue - a.totalRevenue);

        const finalReport = rankedSellers.map((s, index) => ({
            ...s,
            rank: index + 1
        }));

        // 5. Overall Stats
        const globalStats = {
            totalSellers: sellers.length,
            totalRevenue: rankedSellers.reduce((sum, s) => sum + s.totalRevenue, 0),
            totalQuantitySold: rankedSellers.reduce((sum, s) => sum + s.totalSalesQuantity, 0),
            topSeller: rankedSellers[0] ? { name: rankedSellers[0].name, company: rankedSellers[0].companyName } : null
        };

        res.json({
            success: true,
            report: finalReport,
            stats: globalStats,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Analytics Report Error:', error);
        res.status(500).json({
            success: false,
            message: 'Analytical Core Failure: Data aggregation interrupted.',
            error: error.message
        });
    }
};

/**
 * Get Detailed Report for a Specific Seller
 */
const getSellerDetailedReport = async (req, res) => {
    try {
        const sellerId = req.seller.sellerId;

        // 1. Fetch seller's products
        const productsParams = {
            TableName: 'Products',
            FilterExpression: 'sellerId = :sid',
            ExpressionAttributeValues: { ':sid': sellerId }
        };
        const productsResult = await dynamoDB.send(new ScanCommand(productsParams));
        const products = productsResult.Items || [];

        // 2. Fetch seller's recent transactions
        const transactionsParams = {
            TableName: 'Transactions',
            IndexName: 'SellerTransactionsIndex',
            KeyConditionExpression: 'sellerId = :sid',
            ExpressionAttributeValues: { ':sid': sellerId },
            Limit: 20,
            ScanIndexForward: false
        };
        const transactionsResult = await dynamoDB.send(new QueryCommand(transactionsParams));
        const transactions = transactionsResult.Items || [];

        // 3. Process data
        const totalRevenue = products.reduce((sum, p) => sum + ((p.soldQuantity || 0) * (p.price || 0)), 0);
        const totalQuantity = products.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0);
        const lowStockItems = products.filter(p => parseInt(p.quantity) < 10);

        const categoryStats = {};
        products.forEach(p => {
            const cat = p.category || 'General';
            categoryStats[cat] = (categoryStats[cat] || 0) + (p.soldQuantity || 0);
        });

        res.json({
            success: true,
            report: {
                totalRevenue,
                totalQuantity,
                productCount: products.length,
                lowStockCount: lowStockItems.length,
                lowStockItems: lowStockItems.map(p => ({ productId: p.productId, title: p.title, quantity: p.quantity })),
                recentTransactions: transactions,
                categoryDistribution: categoryStats
            },
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Seller Detailed Report Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate your detailed report.',
            error: error.message
        });
    }
};

module.exports = { getSellerPerformanceReport, getSellerDetailedReport };
