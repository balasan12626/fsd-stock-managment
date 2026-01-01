const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { registerSeller, loginSeller, getSellerProfile, refreshToken } = require('./controllers/sellerController');
const { addProduct, updateProduct, deleteProduct, getSellerProducts } = require('./controllers/productController');
const { registerAdmin, loginAdmin, getAdminProfile, getAllAdmins, updateAdminStatus } = require('./controllers/adminController');
const { getSellerPerformanceReport, getSellerDetailedReport } = require('./controllers/analyticsController');
const { getAllProducts, getAllSellers, getProductWithSeller, getDashboardStats, deleteProductAsAdmin } = require('./controllers/adminDashboardController');
const { getSellerTransactions, postTransaction } = require('./controllers/transactionsController');
const authMiddleware = require('./middleware/authMiddleware');
const adminMiddleware = require('./middleware/adminMiddleware');
const upload = require('./middleware/uploadMiddleware');

const app = express();

// Permissive CORS for all origins and methods
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Public routes - Seller
app.post('/api/seller/register', upload.single('logo'), registerSeller);
app.post('/api/seller/login', loginSeller);

// Public routes - Admin
app.post('/api/admin/register', registerAdmin);
app.post('/api/admin/login', loginAdmin);

// Protected seller routes
app.get('/api/seller/profile', authMiddleware, getSellerProfile);
app.post('/api/seller/refresh-token', authMiddleware, refreshToken);
app.get('/api/seller/report', authMiddleware, getSellerDetailedReport);

// Protected product routes
app.post('/api/product/add', authMiddleware, upload.array('images', 5), addProduct);
app.put('/api/product/update', authMiddleware, updateProduct);
app.post('/api/transactions', authMiddleware, postTransaction);
app.delete('/api/product/delete/:productId', authMiddleware, deleteProduct);
app.get('/api/product/seller-products', authMiddleware, getSellerProducts);
app.get('/api/transactions/seller', authMiddleware, getSellerTransactions);

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
