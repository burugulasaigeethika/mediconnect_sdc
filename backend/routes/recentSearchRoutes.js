const express = require('express');
const router = express.Router();
const recentSearchController = require('../controllers/recentSearchController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get recent searches
router.get('/', recentSearchController.getRecentSearches);

// Clear recent searches
router.delete('/clear', recentSearchController.clearRecentSearches);

module.exports = router;