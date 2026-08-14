/**
 * Validation Middleware
 * Provides reusable validation functions for request data
 */

const mongoose = require('mongoose');
const { AppError } = require('./errorHandler');

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName] || req.body[paramName];

        if (!id) {
            return next(new AppError(`${paramName} is required`, 400));
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError(`Invalid ${paramName} format`, 400));
        }

        next();
    };
};

/**
 * Validate required fields
 */
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = [];

        fields.forEach(field => {
            if (!req.body[field]) {
                missingFields.push(field);
            }
        });

        if (missingFields.length > 0) {
            return next(
                new AppError(
                    `Missing required fields: ${missingFields.join(', ')}`,
                    400
                )
            );
        }

        next();
    };
};

/**
 * Validate date format
 */
const validateDate = (fieldName) => {
    return (req, res, next) => {
        const dateValue = req.body[fieldName];

        if (!dateValue) {
            return next(new AppError(`${fieldName} is required`, 400));
        }

        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
            return next(new AppError(`Invalid date format for ${fieldName}`, 400));
        }

        // Optionally check if date is in the future for appointments
        if (fieldName === 'appointmentDate' && date < new Date()) {
            return next(new AppError('Appointment date must be in the future', 400));
        }

        next();
    };
};

/**
 * Validate email format
 */
const validateEmail = (fieldName = 'email') => {
    return (req, res, next) => {
        const email = req.body[fieldName];

        if (!email) {
            return next(new AppError(`${fieldName} is required`, 400));
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return next(new AppError('Invalid email format', 400));
        }

        next();
    };
};

/**
 * Validate phone number format
 */
const validatePhone = (fieldName = 'phone') => {
    return (req, res, next) => {
        const phone = req.body[fieldName];

        if (!phone) {
            return next();
        }

        // Basic phone validation (10 digits, with or without country code)
        const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
        if (!phoneRegex.test(phone)) {
            return next(new AppError('Invalid phone number format', 400));
        }

        next();
    };
};

/**
 * Sanitize input to prevent NoSQL injection
 */
const sanitizeInput = (req, res, next) => {
    // Remove $ and . from input to prevent NoSQL injection
    const sanitize = (obj) => {
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            });
        }
    };

    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);

    next();
};

/**
 * Validate appointment booking data
 */
const validateAppointmentBooking = (req, res, next) => {
    const { doctorId, slotId, date, startTime, endTime } = req.body;

    // Either slotId OR (date + startTime + endTime) must be provided
    const hasSlotId = !!slotId;
    const hasDirectBooking = date && startTime && endTime;

    if (!doctorId) {
        return next(new AppError('Doctor ID is required', 400));
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return next(new AppError('Invalid doctor ID format', 400));
    }

    if (!hasSlotId && !hasDirectBooking) {
        return next(
            new AppError(
                'Either slotId or (date, startTime, endTime) must be provided',
                400
            )
        );
    }

    if (hasSlotId && !mongoose.Types.ObjectId.isValid(slotId)) {
        return next(new AppError('Invalid slot ID format', 400));
    }

    next();
};

module.exports = {
    validateObjectId,
    validateRequiredFields,
    validateDate,
    validateEmail,
    validatePhone,
    sanitizeInput,
    validateAppointmentBooking
};
