const Razorpay = require('razorpay');
const crypto = require('crypto');

// Validate Razorpay credentials
const validateCredentials = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId === 'your_razorpay_key_id' || keySecret === 'your_razorpay_key_secret') {
        console.warn('⚠️ Razorpay credentials not configured properly');
        return false;
    }
    return true;
};

// Initialize Razorpay with environment variables
let razorpay = null;

const getRazorpayInstance = () => {
    if (!razorpay && validateCredentials()) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        console.log('✅ Razorpay initialized');
    }
    return razorpay;
};

/**
 * Create a Razorpay order
 * @param {number} amount - Amount in rupees (will be converted to paise)
 * @param {string} orderId - Internal order ID for receipt
 * @param {Object} notes - Additional notes for the order
 * @returns {Promise<Object>} Razorpay order object
 */
const createOrder = async (amount, orderId, notes = {}) => {
    try {
        const instance = getRazorpayInstance();
        if (!instance) {
            throw new Error('Razorpay is not configured. Please add credentials to .env file.');
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise and ensure integer
            currency: 'INR',
            receipt: `order_${orderId}_${Date.now()}`,
            notes: {
                orderId: orderId,
                ...notes
            }
        };

        console.log('Creating Razorpay order:', options);
        const order = await instance.orders.create(options);
        console.log('✅ Razorpay order created:', order.id);
        return order;
    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        throw new Error(`Failed to create payment order: ${error.message}`);
    }
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId - Razorpay Order ID
 * @param {string} razorpayPaymentId - Razorpay Payment ID
 * @param {string} razorpaySignature - Razorpay Signature
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    try {
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keySecret) {
            console.error('❌ Razorpay key secret not found');
            return false;
        }

        const generatedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        const isValid = generatedSignature === razorpaySignature;

        if (isValid) {
            console.log('✅ Payment signature verified');
        } else {
            console.error('❌ Invalid payment signature');
        }

        return isValid;
    } catch (error) {
        console.error('❌ Error verifying payment signature:', error);
        return false;
    }
};

/**
 * Fetch payment details from Razorpay
 * @param {string} paymentId - Razorpay Payment ID
 * @returns {Promise<Object>} Payment details
 */
const getPaymentDetails = async (paymentId) => {
    try {
        const instance = getRazorpayInstance();
        if (!instance) {
            throw new Error('Razorpay is not configured');
        }

        const payment = await instance.payments.fetch(paymentId);
        return payment;
    } catch (error) {
        console.error('Error fetching payment details:', error);
        throw error;
    }
};

module.exports = {
    createOrder,
    verifyPaymentSignature,
    getPaymentDetails,
    isConfigured: validateCredentials
};

