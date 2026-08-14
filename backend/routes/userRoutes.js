const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update user profile (name, phone)
router.put('/profile', userController.updateProfile);

// Update user delivery address
router.put('/address', userController.updateAddress);

module.exports = router;
