const amqp = require('amqplib');

let channel = null;

const connectToQueue = async () => {
    try {
        const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        const connection = await amqp.connect(rabbitUrl);
        channel = await connection.createChannel();
        console.log('✅ Connected to RabbitMQ');
    } catch (error) {
        console.error('❌ RabbitMQ Connection Error:', error);
    }
};

const sendToCelery = async (taskName, args = [], kwargs = {}) => {
    if (!channel) {
        console.error('RabbitMQ channel not ready. Reconnecting...');
        await connectToQueue();
    }

    if (!channel) return;

    const message = {
        id: require('uuid').v4(),
        task: taskName,
        args: args,
        kwargs: kwargs,
        retries: 0,
        eta: null
    };

    channel.sendToQueue('celery', Buffer.from(JSON.stringify(message)), {
        contentType: 'application/json',
        contentEncoding: 'utf-8'
    });

    console.log(`📨 Sent task to Celery: ${taskName}`);
};

module.exports = { connectToQueue, sendToCelery };
