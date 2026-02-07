// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  updateUserValidation
} = require('../validation/authValidation');
const validate = require('../validation/validate');

// Public routes
router.post('/login', loginValidation, validate, authController.login);

// Protected routes (all authenticated users)
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.put('/profile', protect, updateProfileValidation, validate, authController.updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, authController.changePassword);

// Admin only routes
router.post('/register', registerValidation, validate, authController.register);
// router.post('/register', protect, authorize('admin'), registerValidation, validate, authController.register);
router.get('/users', protect, authorize('admin'), authController.getAllUsers);
router.get('/users/:id', protect, authorize('admin'), authController.getUserById);
router.put('/users/:id', protect, authorize('admin'), updateUserValidation, validate, authController.updateUser);
router.delete('/users/:id', protect, authorize('admin'), authController.deleteUser);

module.exports = router;