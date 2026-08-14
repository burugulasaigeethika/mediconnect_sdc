const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');
const { paymentRateLimiter } = require('../middleware/redisRateLimiter');

// All payment routes require authentication
router.use(authMiddleware);

// Apply rate limiting to payment creation
router.post('/create-order', paymentRateLimiter, paymentController.createOrder);

// Verify payment after successful transaction
router.post('/verify', paymentController.verifyPayment);

// Handle payment failure
router.post('/failure', paymentController.handleFailure);

// Get payment status for an order
router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router;
