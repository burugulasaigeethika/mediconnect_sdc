/**
 * Environment Configuration Module
 * Validates and exports environment variables with defaults
 */

require('dotenv').config();

// Support both MONGODB_URI and MONGO_URI environment variables
if (process.env.MONGO_URI && !process.env.MONGODB_URI) {
    process.env.MONGODB_URI = process.env.MONGO_URI;
}

const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
];

const optionalEnvVars = {
    PORT: 5000,
    NODE_ENV: 'development',
    FRONTEND_URL: 'http://localhost:5173',
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_PORT: 587
};

// Validate required environment variables
const validateEnv = () => {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        console.error('Please configure these required variables in your Render environment settings.');
        process.exit(1);
    }

    // Warn about optional but recommended variables
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️  Email configuration not found. Email features will be disabled.');
    }

    console.log('✅ Environment variables validated');
};

// Export configuration
const config = {
    // Server
    port: process.env.PORT || optionalEnvVars.PORT,
    nodeEnv: process.env.NODE_ENV || optionalEnvVars.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL || optionalEnvVars.FRONTEND_URL,

    // Database
    mongoUri: process.env.MONGODB_URI,

    // JWT
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

    // Email (SMTP)
    email: {
        host: process.env.SMTP_HOST || optionalEnvVars.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || optionalEnvVars.SMTP_PORT,
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
        service: process.env.EMAIL_SERVICE || 'gmail',
        contactEmail: process.env.CONTACT_EMAIL
    },

    // Payment (Razorpay)
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID,
        keySecret: process.env.RAZORPAY_KEY_SECRET
    },

    // OGD API
    ogd: {
        apiKey: process.env.OGD_API_KEY,
        medicineResourceId: process.env.OGD_MEDICINE_RESOURCE_ID
    },

    // Feature flags
    features: {
        emailEnabled: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        paymentEnabled: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    }
};

module.exports = {
    config,
    validateEnv
};
