const { getRedisClient, isRedisConnected } = require('../config/redisClient');

/**
 * Core Redis service providing abstraction for Redis operations
 */

/**
 * Get value from Redis
 * @param {string} key - Redis key
 * @returns {Promise<any>} Parsed value or null
 */
const get = async (key) => {
    try {
        if (!isRedisConnected()) {
            console.warn('⚠️ Redis not connected, skipping cache read');
            return null;
        }

        const client = getRedisClient();
        const value = await client.get(key);

        if (!value) return null;

        // Try to parse JSON, return raw string if not JSON
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    } catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
};

/**
 * Set value in Redis with optional TTL
 * @param {string} key - Redis key
 * @param {any} value - Value to store
 * @param {number} ttlSeconds - Time to live in seconds (optional)
 * @returns {Promise<boolean>} Success status
 */
const set = async (key, value, ttlSeconds = null) => {
    try {
        if (!isRedisConnected()) {
            console.warn('⚠️ Redis not connected, skipping cache write');
            return false;
        }

        const client = getRedisClient();
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

        if (ttlSeconds) {
            await client.setex(key, ttlSeconds, stringValue);
        } else {
            await client.set(key, stringValue);
        }

        return true;
    } catch (error) {
        console.error('Redis SET error:', error);
        return false;
    }
};

/**
 * Delete key from Redis
 * @param {string} key - Redis key
 * @returns {Promise<boolean>} Success status
 */
const del = async (key) => {
    try {
        if (!isRedisConnected()) {
            return false;
        }

        const client = getRedisClient();
        await client.del(key);
        return true;
    } catch (error) {
        console.error('Redis DEL error:', error);
        return false;
    }
};

/**
 * Check if key exists in Redis
 * @param {string} key - Redis key
 * @returns {Promise<boolean>} Existence status
 */
const exists = async (key) => {
    try {
        if (!isRedisConnected()) {
            return false;
        }

        const client = getRedisClient();
        const result = await client.exists(key);
        return result === 1;
    } catch (error) {
        console.error('Redis EXISTS error:', error);
        return false;
    }
};

/**
 * Set key with expiration time
 * @param {string} key - Redis key
 * @param {number} seconds - Expiration in seconds
 * @param {any} value - Value to store
 * @returns {Promise<boolean>} Success status
 */
const setex = async (key, seconds, value) => {
    return await set(key, value, seconds);
};

/**
 * Increment counter (useful for rate limiting)
 * @param {string} key - Redis key
 * @returns {Promise<number>} New value after increment
 */
const incr = async (key) => {
    try {
        if (!isRedisConnected()) {
            return 0;
        }

        const client = getRedisClient();
        return await client.incr(key);
    } catch (error) {
        console.error('Redis INCR error:', error);
        return 0;
    }
};

/**
 * Set expiration on existing key
 * @param {string} key - Redis key
 * @param {number} seconds - Expiration in seconds
 * @returns {Promise<boolean>} Success status
 */
const expire = async (key, seconds) => {
    try {
        if (!isRedisConnected()) {
            return false;
        }

        const client = getRedisClient();
        await client.expire(key, seconds);
        return true;
    } catch (error) {
        console.error('Redis EXPIRE error:', error);
        return false;
    }
};

/**
 * Get time to live for a key
 * @param {string} key - Redis key
 * @returns {Promise<number>} TTL in seconds, -1 if no expiry, -2 if key doesn't exist
 */
const ttl = async (key) => {
    try {
        if (!isRedisConnected()) {
            return -2;
        }

        const client = getRedisClient();
        return await client.ttl(key);
    } catch (error) {
        console.error('Redis TTL error:', error);
        return -2;
    }
};

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., "cache:medicines:*")
 * @returns {Promise<number>} Number of keys deleted
 */
const deletePattern = async (pattern) => {
    try {
        if (!isRedisConnected()) {
            return 0;
        }

        const client = getRedisClient();
        const keys = await client.keys(pattern);

        if (keys.length === 0) {
            return 0;
        }

        await client.del(...keys);
        return keys.length;
    } catch (error) {
        console.error('Redis DELETE PATTERN error:', error);
        return 0;
    }
};

module.exports = {
    get,
    set,
    del,
    exists,
    setex,
    incr,
    expire,
    ttl,
    deletePattern
};
