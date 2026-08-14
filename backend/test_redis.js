const Redis = require('ioredis');
require('dotenv').config();

console.log('Testing Redis connection...');
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log('URL:', redisUrl);

const redisConfig = {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000
};

if (process.env.REDIS_PASSWORD) {
    redisConfig.password = process.env.REDIS_PASSWORD;
}

try {
    const client = new Redis(redisUrl, redisConfig);
    client.on('connect', () => console.log('Connect event'));
    client.on('ready', () => {
        console.log('Ready event');
        process.exit(0);
    });
    client.on('error', (err) => {
        console.error('Error event:', err.message);
        process.exit(1);
    });
} catch (e) {
    console.error('Catch block error:', e);
    process.exit(1);
}
