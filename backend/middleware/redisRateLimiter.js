const redisService = require('../services/redisService');

/**
 * Redis-based Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP/user
 */

/**
 * Create a rate limiter middleware
 * @param {Object} options - Rate limiter options
 * @param {string} options.keyPrefix - Redis key prefix
 * @param {number} options.maxRequests - Maximum requests allowed
 * @param {number} options.windowSeconds - Time window in seconds
 * @param {string} options.message - Error message
 * @param {Function} options.keyGenerator - Custom key generator function
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options) => {
    const {
        keyPrefix = 'ratelimit:',
        maxRequests = 100,
        windowSeconds = 15 * 60, // 15 minutes
        message = 'Too many requests, please try again later',
        keyGenerator = (req) => req.ip
    } = options;

    return async (req, res, next) => {
        try {
            // Generate unique key for this request
            const identifier = keyGenerator(req);
            const key = `${keyPrefix}${identifier}`;

            // Increment counter
            const requests = await redisService.incr(key);

            // Set expiration on first request
            if (requests === 1) {
                await redisService.expire(key, windowSeconds);
            }

            // Get TTL for rate limit reset time
            const ttl = await redisService.ttl(key);

            // Set rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requests));
            res.setHeader('X-RateLimit-Reset', Date.now() + (ttl * 1000));

            // Check if limit exceeded
            if (requests > maxRequests) {
                console.warn(`⚠️ Rate limit exceeded for ${identifier}`);
                return res.status(429).json({
                    message,
                    retryAfter: ttl
                });
            }

            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            // On error, allow the request (fail open)
            next();
        }
    };
};

/**
 * Login rate limiter
 * Limits login attempts to prevent brute force attacks
 */
const loginRateLimiter = createRateLimiter({
    keyPrefix: 'ratelimit:login:',
    maxRequests: 5,
    windowSeconds: 15 * 60, // 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
    keyGenerator: (req) => {
        // Use IP + email combination for more precise limiting
        const email = req.body.email || 'unknown';
        return `${req.ip}:${email}`;
    }
});

/**
 * OTP rate limiter
 * Limits OTP requests to prevent spam
 */
const otpRateLimiter = createRateLimiter({
    keyPrefix: 'ratelimit:otp:',
    maxRequests: 3,
    windowSeconds: 15 * 60, // 15 minutes
    message: 'Too many OTP requests. Please try again in 15 minutes.',
    keyGenerator: (req) => {
        const email = req.body.email || req.ip;
        return email;
    }
});

/**
 * General API rate limiter
 * Limits general API requests per IP
 */
const apiRateLimiter = createRateLimiter({
    keyPrefix: 'ratelimit:api:',
    maxRequests: 100,
    windowSeconds: 15 * 60, // 15 minutes
    message: 'Too many requests from this IP. Please try again later.',
    keyGenerator: (req) => req.ip
});

/**
 * Payment rate limiter
 * Limits payment creation requests
 */
const paymentRateLimiter = createRateLimiter({
    keyPrefix: 'ratelimit:payment:',
    maxRequests: 10,
    windowSeconds: 60 * 60, // 1 hour
    message: 'Too many payment requests. Please try again later.',
    keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise IP
        return req.user?.userId || req.ip;
    }
});

module.exports = {
    createRateLimiter,
    loginRateLimiter,
    otpRateLimiter,
    apiRateLimiter,
    paymentRateLimiter
};
