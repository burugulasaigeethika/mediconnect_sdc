/**
 * Request Logger Middleware
 * Logs all incoming requests with timing information
 */

const requestLogger = (req, res, next) => {
    const startTime = Date.now();

    // Log response only (removed verbose request details)
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusEmoji = res.statusCode < 400 ? '✅' : '❌';

        // Only log errors (400+) to reduce console noise
        if (res.statusCode >= 400) {
            console.log(`${statusEmoji} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
        }
    });

    next();
};

module.exports = requestLogger;
