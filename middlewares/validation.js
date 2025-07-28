const { body, validationResult, query } = require('express-validator');

// Common validation rules
exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['admin', 'user']).withMessage('Invalid role')
];

// Middleware to handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};


exports.TechnicianValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Please provide a valid email'),
    
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]*$/).withMessage('Please provide a valid phone number'),
    
  body('address')
    .optional(),
    
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    
  body('status')
    .optional()
    .isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
];


exports.taskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim(),
    
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'on_hold']).withMessage('Invalid status'),
    
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    
  body('dueDate')
    .optional()
    .isISO8601().withMessage('Invalid date format. Use ISO8601 (e.g., YYYY-MM-DD)'),
    
  body('TechnicianId')
    .optional()
    .isInt().withMessage('Technician ID must be an integer')
];

// Query validation for GET /tasks
exports.getTasksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'on_hold']).withMessage('Invalid status filter'),
    
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority filter'),
    
  query('TechnicianId')
    .optional()
    .isInt().withMessage('Technician ID must be an integer'),
    
  query('dueDateFrom')
    .optional()
    .isISO8601().withMessage('Invalid date format for dueDateFrom. Use ISO8601 (e.g., YYYY-MM-DD)'),
    
  query('dueDateTo')
    .optional()
    .isISO8601().withMessage('Invalid date format for dueDateTo. Use ISO8601 (e.g., YYYY-MM-DD)')
];


exports.profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
  body('email')
    .optional()
    .isEmail().withMessage('Please include a valid email'),
    
  body('currentPassword')
    .if((value, { req }) => req.body.newPassword)
    .notEmpty().withMessage('Current password is required when setting a new password'),
    
  body('newPassword')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

exports.userUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
  body('email')
    .optional()
    .isEmail().withMessage('Please include a valid email'),
    
  body('role')
    .optional()
    .isIn(['user', 'admin']).withMessage('Invalid role'),
    
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

exports.queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
  query('search')
    .optional()
    .trim()
];