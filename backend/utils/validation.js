const { body, validationResult } = require('express-validator');

const validateName = () => {
  return body('name')
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be 20-60 characters');
};

const validateEmail = () => {
  return body('email')
    .isEmail()
    .withMessage('Invalid email');
};

const validateAddress = () => {
  return body('address')
    .isLength({ max: 400 })
    .withMessage('Address too long');
};

const validatePassword = () => {
  return body('password')
    .isLength({ min: 8, max: 16 })
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Password must be 8-16 chars with uppercase and special char');
};

const validateRating = () => {
  return body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be 1-5');
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Invalid data',
      errors: errors.array() 
    });
  }
  next();
};

const userValidation = [
  validateName(),
  validateEmail(),
  validateAddress(),
  validatePassword(),
  handleValidationErrors
];

const storeValidation = [
  body('name').notEmpty().withMessage('Store name is required'),
  validateEmail(),
  validateAddress(),
  handleValidationErrors
];

const ratingValidation = [
  validateRating(),
  handleValidationErrors
];

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating,
  handleValidationErrors,
  userValidation,
  storeValidation,
  ratingValidation
}; 