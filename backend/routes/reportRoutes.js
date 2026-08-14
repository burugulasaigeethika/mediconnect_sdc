const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/monthly', protect, authorize('admin'), reportController.getMonthlyReport);
router.post('/monthly/background', protect, authorize('admin'), reportController.triggerMonthlyReport);
router.get('/revenue', protect, authorize('admin'), reportController.getRevenueReport);
router.get('/user-growth', protect, authorize('admin'), reportController.getUserGrowthReport);
router.get('/performance', protect, authorize('admin'), reportController.getPerformanceReport);

module.exports = router;
