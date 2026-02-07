// backend/src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');
const upload = require('../middleware/uploadMiddleware');
const {
  createDocumentValidation,
  updateDocumentValidation,
  searchDocumentsValidation,
  getDocumentByIdValidation
} = require('../validation/documentValidation');
const validate = require('../validation/validate');

// All routes are protected
router.use(protect);

// Search and filter
router.get('/search', searchDocumentsValidation, validate, documentController.searchDocuments);

// Get all documents
router.get('/', documentController.getAllDocuments);

// Get document by ID
router.get('/:id', getDocumentByIdValidation, validate, documentController.getDocumentById);

// Admin only routes
router.post(
  '/',
  authorize('admin'),
  upload.single('image'),
  createDocumentValidation,
  validate,
  documentController.createDocument
);

router.put(
  '/:id',
  authorize('admin'),
  upload.single('image'),
  updateDocumentValidation,
  validate,
  documentController.updateDocument
);

router.delete(
  '/:id',
  authorize('admin'),
  getDocumentByIdValidation,
  validate,
  documentController.deleteDocument
);

module.exports = router;
