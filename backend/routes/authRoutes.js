const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, verifyOTP, resetPassword, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { loginRateLimiter, otpRateLimiter } = require('../middleware/redisRateLimiter');

// Public routes with rate limiting
router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/forgot-password', otpRateLimiter, forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/logout', authMiddleware, logout);
router.get('/verify', authMiddleware, (req, res) => res.json({ valid: true, user: req.user }));

module.exports = router;
