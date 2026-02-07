// backend/src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

// All routes are protected
router.use(protect);

// Get all notifications for current user
router.get('/', notificationController.getMyNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Mark single notification as read
router.put('/:id/read', notificationController.markAsRead);

// Delete all notifications
router.delete('/', notificationController.deleteAllNotifications);

// Delete single notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;