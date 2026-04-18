const rateLimit = require('express-rate-limit');

/**
 * Standard Login Rate Limiter (Brute Force Protection)
 * Increased limits for development/testing flexibility
 */
const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // Limit each IP to 20 login attempts per window
    message: { 
        success: false, 
        message: 'Too many login attempts from this IP. Please try again after 10 minutes.' 
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Optional: Skip rate limiting in development if needed
    // skip: (req) => process.env.NODE_ENV === 'development'
});

/**
 * Global API Rate Limiter
 */
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { 
        success: false, 
        message: 'Rate limit exceeded. System throttling active.' 
    }
});

module.exports = { loginLimiter, apiLimiter };
