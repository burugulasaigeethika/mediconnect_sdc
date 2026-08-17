const Redis = require('ioredis');
const { config } = require('./env');

let redisClient = null;

/**
 * Initialize Redis client with configuration
 */
const initRedisClient = () => {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        const redisConfig = {
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                console.log(`⏳ Redis reconnecting... attempt ${times}, delay ${delay}ms`);
                // Stop retrying after 10 attempts
                if (times > 10) {
                    console.warn('⚠️ Redis connection failed after 10 attempts. Continuing without Redis.');
                    return null;
                }
                return delay;
            },
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            lazyConnect: false,
            connectTimeout: 10000,
            commandTimeout: 5000
        };

        // Add password if provided and not already specified in the URL
        if (process.env.REDIS_PASSWORD && !redisUrl.includes('@')) {
            redisConfig.password = process.env.REDIS_PASSWORD;
        }

        // Add TLS if enabled or if connection string starts with rediss://
        if (process.env.REDIS_TLS === 'true' || redisUrl.startsWith('rediss://')) {
            redisConfig.tls = {
                rejectUnauthorized: false
            };
        }

        // Helper to mask password in Redis URL for safe logging
        const maskRedisUrl = (url) => {
            try {
                const parsed = new URL(url);
                if (parsed.password) {
                    parsed.password = '****';
                }
                return parsed.toString();
            } catch (e) {
                return url.replace(/:[^:@\s]+@/, ':****@');
            }
        };

        console.log(`🔌 Attempting to connect to Redis at ${maskRedisUrl(redisUrl)}`);
        redisClient = new Redis(redisUrl, redisConfig);

        // Event handlers
        redisClient.on('connect', () => {
            console.log('🔌 Redis client connecting...');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis connected successfully');
        });

        redisClient.on('error', (err) => {
            console.error('❌ Redis error:', err.message);
        });

        redisClient.on('close', () => {
            console.log('🔌 Redis connection closed');
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Redis reconnecting...');
        });

        return redisClient;
    } catch (error) {
        console.error('❌ Failed to initialize Redis client:', error);
        return null;
    }
};

/**
 * Get Redis client instance
 */
const getRedisClient = () => {
    if (!redisClient) {
        try {
            return initRedisClient();
        } catch (error) {
            console.warn('⚠️ Failed to get Redis client:', error.message);
            return null;
        }
    }
    return redisClient;
};

/**
 * Close Redis connection gracefully
 */
const closeRedisConnection = async () => {
    if (redisClient) {
        try {
            await redisClient.quit();
            console.log('✅ Redis connection closed gracefully');
        } catch (error) {
            console.error('❌ Error closing Redis connection:', error);
            redisClient.disconnect();
        }
    }
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => {
    return redisClient && redisClient.status === 'ready';
};

module.exports = {
    initRedisClient,
    getRedisClient,
    closeRedisConnection,
    isRedisConnected
};
