// backend/src/routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const documentController = require('../controllers/documentController');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected
router.use(protect);

// Search and filter
router.get('/search', documentController.searchDocuments);

// Get all documents
router.get('/', documentController.getAllDocuments);

// Get document by ID
router.get('/:id', documentController.getDocumentById);

// Admin only routes
router.post(
  '/',
  authorize('admin'),
  upload.single('image'),
  documentController.createDocument
);

router.put(
  '/:id',
  authorize('admin'),
  upload.single('image'),
  documentController.updateDocument
);

router.delete(
  '/:id',
  authorize('admin'),
  documentController.deleteDocument
);

module.exports = router;