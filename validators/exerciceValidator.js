const { body, validationResult } = require('express-validator');

// Exercise creation validation
const exerciseCreationValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('difficulty').notEmpty().withMessage('Difficulty is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Middleware to handle validation errors
const validate = (req, res, next) => {


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { exerciseCreationValidation, validate };
