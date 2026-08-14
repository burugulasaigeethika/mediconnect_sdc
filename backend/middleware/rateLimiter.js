/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP address
 */

// Simple in-memory rate limiter (for production, use Redis)
const rateLimit = new Map();

/**
 * Create rate limiter with specified options
 */
const createRateLimiter = (options = {}) => {
    const {
        windowMs = 15 * 60 * 1000, // 15 minutes
        max = 100, // Max requests per window
        message = 'Too many requests, please try again later',
        skipSuccessfulRequests = false
    } = options;

    return (req, res, next) => {
        const key = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        // Clean up old entries
        for (const [ip, data] of rateLimit.entries()) {
            if (now - data.resetTime > windowMs) {
                rateLimit.delete(ip);
            }
        }

        // Get or create rate limit data for this IP
        if (!rateLimit.has(key)) {
            rateLimit.set(key, {
                count: 0,
                resetTime: now
            });
        }

        const data = rateLimit.get(key);

        // Reset if window has passed
        if (now - data.resetTime > windowMs) {
            data.count = 0;
            data.resetTime = now;
        }

        // Check if limit exceeded
        if (data.count >= max) {
            return res.status(429).json({
                status: 'error',
                message: message,
                retryAfter: Math.ceil((data.resetTime + windowMs - now) / 1000)
            });
        }

        // Increment count
        data.count++;

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', max - data.count);
        res.setHeader('X-RateLimit-Reset', new Date(data.resetTime + windowMs).toISOString());

        next();
    };
};

// Strict rate limiter for authentication endpoints
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Increased for testing
    message: 'Too many authentication attempts, please try again later'
});

// General API rate limiter
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
});

// Lenient rate limiter for general routes
const generalLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 300
});

module.exports = {
    createRateLimiter,
    authLimiter,
    apiLimiter,
    generalLimiter
};
