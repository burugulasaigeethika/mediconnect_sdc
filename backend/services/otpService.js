const crypto = require('crypto');
const redisService = require('./redisService');

/**
 * OTP Service using Redis for storage
 * Handles OTP generation, storage, validation, and cleanup
 */

// OTP configuration
const OTP_CONFIG = {
    LENGTH: 6,
    TTL: 5 * 60, // 5 minutes in seconds
    MAX_ATTEMPTS: 3
};

// Redis key prefixes
const OTP_KEY_PREFIX = 'otp:';
const OTP_ATTEMPTS_PREFIX = 'otp_attempts:';

/**
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
const generateOTPCode = () => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate and store OTP for a user
 * @param {string} email - User email
 * @param {string} userId - User ID (optional)
 * @returns {Promise<{success: boolean, otp?: string, error?: string}>}
 */
const generateOTP = async (email, userId = null) => {
    try {
        const otp = generateOTPCode();
        const key = `${OTP_KEY_PREFIX}${email}`;

        // Store OTP data
        const otpData = {
            otp,
            email,
            userId,
            createdAt: Date.now(),
            used: false
        };

        // Store in Redis with TTL
        const stored = await redisService.setex(key, OTP_CONFIG.TTL, otpData);

        if (!stored) {
            return {
                success: false,
                error: 'Failed to store OTP in cache'
            };
        }

        console.log(`✅ OTP generated for ${email} (expires in ${OTP_CONFIG.TTL}s)`);

        return {
            success: true,
            otp
        };
    } catch (error) {
        console.error('Error generating OTP:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Verify OTP for a user
 * @param {string} email - User email
 * @param {string} otp - OTP to verify
 * @returns {Promise<{success: boolean, message?: string, userId?: string}>}
 */
const verifyOTP = async (email, otp) => {
    try {
        const key = `${OTP_KEY_PREFIX}${email}`;

        // Get OTP data from Redis
        const otpData = await redisService.get(key);

        if (!otpData) {
            return {
                success: false,
                message: 'OTP not found or expired'
            };
        }

        // Check if OTP has been used
        if (otpData.used) {
            return {
                success: false,
                message: 'OTP has already been used'
            };
        }

        // Verify OTP
        if (otpData.otp !== otp.toString()) {
            // Increment failed attempts
            await incrementOTPAttempts(email);

            return {
                success: false,
                message: 'Invalid OTP'
            };
        }

        // Mark OTP as used (but keep it for password reset flow)
        otpData.used = true;
        const ttl = await redisService.ttl(key);

        if (ttl > 0) {
            await redisService.setex(key, ttl, otpData);
        }

        console.log(`✅ OTP verified for ${email}`);

        return {
            success: true,
            message: 'OTP verified successfully',
            userId: otpData.userId
        };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return {
            success: false,
            message: error.message
        };
    }
};

/**
 * Check if OTP has been verified (for password reset flow)
 * @param {string} email - User email
 * @returns {Promise<boolean>}
 */
const isOTPVerified = async (email) => {
    try {
        const key = `${OTP_KEY_PREFIX}${email}`;
        const otpData = await redisService.get(key);

        return otpData && otpData.used === true;
    } catch (error) {
        console.error('Error checking OTP verification:', error);
        return false;
    }
};

/**
 * Delete OTP from storage
 * @param {string} email - User email
 * @returns {Promise<boolean>}
 */
const deleteOTP = async (email) => {
    try {
        const key = `${OTP_KEY_PREFIX}${email}`;
        await redisService.del(key);

        // Also delete attempts counter
        const attemptsKey = `${OTP_ATTEMPTS_PREFIX}${email}`;
        await redisService.del(attemptsKey);

        console.log(`🗑️ OTP deleted for ${email}`);
        return true;
    } catch (error) {
        console.error('Error deleting OTP:', error);
        return false;
    }
};

/**
 * Increment failed OTP attempts
 * @param {string} email - User email
 * @returns {Promise<number>} Number of attempts
 */
const incrementOTPAttempts = async (email) => {
    try {
        const key = `${OTP_ATTEMPTS_PREFIX}${email}`;
        const attempts = await redisService.incr(key);

        // Set expiration (same as OTP TTL)
        await redisService.expire(key, OTP_CONFIG.TTL);

        if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
            // Delete OTP after max attempts
            await deleteOTP(email);
            console.warn(`⚠️ Max OTP attempts reached for ${email}`);
        }

        return attempts;
    } catch (error) {
        console.error('Error incrementing OTP attempts:', error);
        return 0;
    }
};

/**
 * Get remaining OTP attempts
 * @param {string} email - User email
 * @returns {Promise<number>}
 */
const getRemainingAttempts = async (email) => {
    try {
        const key = `${OTP_ATTEMPTS_PREFIX}${email}`;
        const attempts = await redisService.get(key) || 0;
        return Math.max(0, OTP_CONFIG.MAX_ATTEMPTS - attempts);
    } catch (error) {
        console.error('Error getting remaining attempts:', error);
        return OTP_CONFIG.MAX_ATTEMPTS;
    }
};

module.exports = {
    generateOTP,
    verifyOTP,
    isOTPVerified,
    deleteOTP,
    getRemainingAttempts,
    OTP_CONFIG
};
