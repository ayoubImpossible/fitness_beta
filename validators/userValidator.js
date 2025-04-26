const { body, validationResult } = require('express-validator');

// User registration validation
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 8 ,max:19})
    .withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
];

// User login validation
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { registerValidation, loginValidation, validate };
