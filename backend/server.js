const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { registerSeller, loginSeller, getSellerProfile, refreshToken } = require('./controllers/sellerController');
const { addProduct, updateProduct, deleteProduct, getSellerProducts } = require('./controllers/productController');
const authMiddleware = require('./middleware/authMiddleware');
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

// Public routes
app.post('/api/seller/register', upload.single('logo'), registerSeller);
app.post('/api/seller/login', loginSeller);

// Protected seller routes
app.get('/api/seller/profile', authMiddleware, getSellerProfile);
app.post('/api/seller/refresh-token', authMiddleware, refreshToken);

// Protected product routes
app.post('/api/product/add', authMiddleware, upload.array('images', 5), addProduct);
app.put('/api/product/update', authMiddleware, updateProduct);
app.delete('/api/product/delete/:productId', authMiddleware, deleteProduct);
app.get('/api/product/seller-products', authMiddleware, getSellerProducts);

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
