const crypto = require('crypto');
const redisService = require('./redisService');
const jwt = require('jsonwebtoken');

/**
 * Token Blacklist Service using Redis
 * Manages blacklisted JWT tokens on logout
 */

// Redis key prefix
const BLACKLIST_PREFIX = 'blacklist:';

/**
 * Generate a hash of the token for storage
 * @param {string} token - JWT token
 * @returns {string} Token hash
 */
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Add token to blacklist
 * @param {string} token - JWT token to blacklist
 * @param {number} expiresIn - Token expiration time in seconds (optional)
 * @returns {Promise<boolean>} Success status
 */
const blacklistToken = async (token, expiresIn = null) => {
    try {
        const tokenHash = hashToken(token);
        const key = `${BLACKLIST_PREFIX}${tokenHash}`;

        // If expiresIn not provided, extract from token
        let ttl = expiresIn;
        if (!ttl) {
            try {
                const decoded = jwt.decode(token);
                if (decoded && decoded.exp) {
                    // Calculate remaining time until expiration
                    const now = Math.floor(Date.now() / 1000);
                    ttl = decoded.exp - now;

                    // If token already expired, no need to blacklist
                    if (ttl <= 0) {
                        console.log('⚠️ Token already expired, skipping blacklist');
                        return true;
                    }
                }
            } catch (error) {
                console.error('Error decoding token for TTL:', error);
                // Default to 7 days if we can't decode
                ttl = 7 * 24 * 60 * 60;
            }
        }

        // Store token hash in blacklist with TTL
        const stored = await redisService.setex(
            key,
            ttl || 7 * 24 * 60 * 60, // Default 7 days
            { blacklistedAt: Date.now() }
        );

        if (stored) {
            console.log(`🚫 Token blacklisted (TTL: ${ttl}s)`);
        }

        return stored;
    } catch (error) {
        console.error('Error blacklisting token:', error);
        return false;
    }
};

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token to check
 * @returns {Promise<boolean>} True if blacklisted
 */
const isTokenBlacklisted = async (token) => {
    try {
        const tokenHash = hashToken(token);
        const key = `${BLACKLIST_PREFIX}${tokenHash}`;

        const exists = await redisService.exists(key);

        if (exists) {
            console.log('⚠️ Token is blacklisted');
        }

        return exists;
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        // In case of error, allow the request (fail open)
        // This prevents Redis issues from blocking all requests
        return false;
    }
};

/**
 * Remove token from blacklist (rarely needed)
 * @param {string} token - JWT token
 * @returns {Promise<boolean>} Success status
 */
const removeFromBlacklist = async (token) => {
    try {
        const tokenHash = hashToken(token);
        const key = `${BLACKLIST_PREFIX}${tokenHash}`;

        await redisService.del(key);
        console.log('✅ Token removed from blacklist');
        return true;
    } catch (error) {
        console.error('Error removing token from blacklist:', error);
        return false;
    }
};

/**
 * Get total number of blacklisted tokens (for monitoring)
 * @returns {Promise<number>} Count of blacklisted tokens
 */
const getBlacklistCount = async () => {
    try {
        const pattern = `${BLACKLIST_PREFIX}*`;
        const keys = await redisService.get(pattern);
        return keys ? keys.length : 0;
    } catch (error) {
        console.error('Error getting blacklist count:', error);
        return 0;
    }
};

module.exports = {
    blacklistToken,
    isTokenBlacklisted,
    removeFromBlacklist,
    getBlacklistCount
};
