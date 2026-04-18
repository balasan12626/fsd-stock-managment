const express = require('express');
const router = express.Router();
const {
    registerCustomer,
    loginCustomer,
    verifyEmail,
    getShopProducts,
    getProductDetails,
    getCart,
    addToCart,
    removeFromCart,
    createOrder,
    getCustomerOrders,
    getReviews,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/customerController');
const { registerValidation, loginValidation } = require('../middleware/validationMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimitMiddleware');
const customerAuthorize = authorize('customer');

// Public
router.post('/register', registerValidation, registerCustomer);
router.post('/login', loginLimiter, loginValidation, loginCustomer);
router.post('/verify-email', verifyEmail);
router.get('/products', getShopProducts);
router.get('/products/:productId', getProductDetails);

// Protected
router.get('/cart', protect, customerAuthorize, getCart);
router.post('/cart', protect, customerAuthorize, addToCart);
router.delete('/cart/:productId', protect, customerAuthorize, removeFromCart);

// Orders
router.post('/orders', protect, customerAuthorize, createOrder);
router.get('/orders', protect, customerAuthorize, getCustomerOrders);

// Reviews
router.get('/products/:productId/reviews', getReviews);
router.post('/products/:productId/reviews', protect, customerAuthorize, addReview);
router.put('/products/:productId/reviews/:reviewId', protect, customerAuthorize, updateReview);
router.delete('/products/:productId/reviews/:reviewId', protect, customerAuthorize, deleteReview);

module.exports = router;
