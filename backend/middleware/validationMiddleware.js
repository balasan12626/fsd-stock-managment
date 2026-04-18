const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
            message: 'Input Validation Failure: Malformed data detected.'
        });
    }
    next();
};

const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Security minimum: 8 characters required')
        .matches(/\d/)
        .withMessage('Security requirement: Password must contain at least one digit')
        .matches(/[A-Z]/)
        .withMessage('Security requirement: Password must contain at least one uppercase letter'),
    validate
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email format required'),
    body('password').notEmpty().withMessage('Security Key required'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    validate
};
