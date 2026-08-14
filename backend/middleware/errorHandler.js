/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses across the application
 */

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Only log errors that aren't 404s (to reduce noise)
    if (err.statusCode !== 404) {
        console.error(`❌ ${req.method} ${req.path} - ${err.statusCode} (${err.message})`);
    }

    // Development error response (detailed)
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }

    // Production error response (minimal)
    // Don't leak error details to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Programming or unknown error: don't leak details
    console.error('UNEXPECTED ERROR:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server'
    });
};

// Handle async errors
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// Handle 404 errors
const notFound = (req, res, next) => {
    const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
    next(error);
};

module.exports = {
    AppError,
    errorHandler,
    catchAsync,
    notFound
};
