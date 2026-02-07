// backend/src/validation/documentValidation.js
const { body, param, query } = require('express-validator');

const createDocumentValidation = [
  body('type')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['PURCHASE_ORDER', 'SALES_INVOICE', 'DELIVERY_RECEIPT'])
    .withMessage('Invalid document type'),
  
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('documentNumber')
    .notEmpty()
    .withMessage('Document number is required')
    .isInt({ min: 1 })
    .withMessage('Document number must be a positive integer'),
  
  body('documentDate')
    .notEmpty()
    .withMessage('Document date is required')
    .isISO8601()
    .withMessage('Invalid date format')
];

const updateDocumentValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid document ID'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('documentNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Document number must be a positive integer'),
  
  body('documentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const searchDocumentsValidation = [
  query('type')
    .optional()
    .isIn(['ALL', 'PURCHASE_ORDER', 'SALES_INVOICE', 'DELIVERY_RECEIPT'])
    .withMessage('Invalid document type'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const getDocumentByIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid document ID')
];

module.exports = {
  createDocumentValidation,
  updateDocumentValidation,
  searchDocumentsValidation,
  getDocumentByIdValidation
};
