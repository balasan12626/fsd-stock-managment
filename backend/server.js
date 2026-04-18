const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const sellerController = require('./controllers/sellerController');
const { addProduct, updateProduct, deleteProduct, getSellerProducts } = require('./controllers/productController');
const { registerAdmin, loginAdmin, getAdminProfile, getAllAdmins, updateAdminStatus } = require('./controllers/adminController');
const { getSellerPerformanceReport, getSellerDetailedReport } = require('./controllers/analyticsController');
const { getAllProducts, getAllSellers, getProductWithSeller, getDashboardStats, deleteProductAsAdmin, getAllCustomers, deleteCustomer, deleteSeller } = require('./controllers/adminDashboardController');
const analyticsController = require('./controllers/analyticsController');
const { getSellerTransactions, postTransaction } = require('./controllers/transactionsController');
const { protect, authorize } = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const upload = require('./middleware/uploadMiddleware');
const customerRoutes = require('./routes/customerRoutes');
const publicRoutes = require('./routes/publicRoutes');

const customerController = require('./controllers/customerController');

const { loginLimiter, apiLimiter } = require('./middleware/rateLimitMiddleware');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const app = express();

// --- SECURITY PROTOCOLS ---
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"]
        }
    }
}));

// 3. CORS (must come before body parsers to handle preflight OPTIONS)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

app.use(xss()); // XSS sanitization on all incoming request bodies
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));        // JSON body limit - prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Global API Rate Limiter
app.use('/api/', apiLimiter);

const { registerValidation, loginValidation } = require('./middleware/validationMiddleware');

// System Core Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Operational',
        timestamp: new Date().toISOString(),
        core: 'a6b-v2.5',
        security: 'Armed'
    });
});

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Public routes - Seller
app.post('/api/seller/register', upload.single('logo'), registerValidation, sellerController.registerSeller);
app.post('/api/seller/login', loginLimiter, loginValidation, sellerController.loginSeller);

// Public routes - Admin
app.post('/api/admin/register', registerValidation, registerAdmin);
app.post('/api/admin/login', loginLimiter, loginValidation, loginAdmin);

// Protected seller routes
app.get('/api/seller/profile', protect, authorize('seller'), sellerController.getSellerProfile);
app.post('/api/seller/refresh-token', protect, authorize('seller'), sellerController.refreshToken);
app.get('/api/analytics/report', protect, authorize('seller'), analyticsController.getSellerDetailedReport);
app.get('/api/analytics/forecast', protect, authorize('seller'), analyticsController.getDemandForecast); // AI Route

// Protected product routes
app.post('/api/seller/products', protect, authorize('seller', 'admin'), upload.array('images', 5), addProduct);
app.post('/api/seller/products/bulk', protect, authorize('seller', 'admin'), sellerController.bulkAddProducts);
app.get('/api/seller/products/:sellerId', protect, authorize('seller', 'admin'), getSellerProducts);
app.post('/api/transactions', protect, authorize('seller', 'customer'), postTransaction);
app.delete('/api/product/delete/:productId', protect, authorize('seller'), deleteProduct);
app.get('/api/product/seller-products', protect, authorize('seller'), getSellerProducts);
app.get('/api/transactions/seller', protect, authorize('seller'), getSellerTransactions);

// Protected admin routes
app.get('/api/admin/profile', adminMiddleware, getAdminProfile);
app.get('/api/admin/products', adminMiddleware, getAllProducts);
app.get('/api/admin/sellers', adminMiddleware, getAllSellers);
app.get('/api/admin/products/:productId', adminMiddleware, getProductWithSeller);
app.get('/api/admin/stats', adminMiddleware, getDashboardStats);
app.delete('/api/admin/products/:productId', adminMiddleware, deleteProductAsAdmin);
app.get('/api/admin/manage/all', adminMiddleware, getAllAdmins);
app.put('/api/admin/manage/status/:adminId', adminMiddleware, updateAdminStatus);
app.get('/api/admin/reports/seller-performance', adminMiddleware, getSellerPerformanceReport);
app.get('/api/admin/orders', adminMiddleware, customerController.getAllOrders);
app.get('/api/admin/customers', adminMiddleware, getAllCustomers);
app.delete('/api/admin/customers/:email', adminMiddleware, deleteCustomer);
app.delete('/api/admin/sellers/:sellerId', adminMiddleware, deleteSeller);

// Seller Order Routes
app.get('/api/seller/orders/:sellerId', protect, authorize('seller', 'admin', 'superadmin'), customerController.getSellerOrders);

// Customer Routes
app.use('/api/public', publicRoutes);
app.put('/api/orders/:orderId/status', protect, authorize('seller', 'admin', 'superadmin'), customerController.updateOrderStatus);
app.use('/api/customer', customerRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    if (err.stack) console.error(err.stack);

    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.error(`💡 Suggestion: Kill the process using port ${PORT} or change the PORT in your .env file.`);
        process.exit(1);
    } else {
        console.error('Server error:', error);
    }
});
