const Order = require('../models/Order');
const paymentService = require('../services/paymentService');

/**
 * Create Razorpay order for payment
 * POST /api/payments/create-order
 */
exports.createOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId;

        // Validate input
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Find the order in database
        const order = await Order.findOne({ orderId }).populate('patient', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user owns this order
        if (order.patient._id.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access to this order' });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({ message: 'Order is already paid' });
        }

        // Check if Razorpay is configured
        if (!paymentService.isConfigured()) {
            return res.status(503).json({
                message: 'Payment service is not configured. Please contact support.',
                error: 'Razorpay credentials missing'
            });
        }

        // Create Razorpay order
        const razorpayOrder = await paymentService.createOrder(
            order.totalAmount,
            order.orderId,
            {
                patientName: order.patient.name,
                patientEmail: order.patient.email
            }
        );

        // Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        order.paymentMethod = 'online';
        await order.save();

        res.json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: order.orderId,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            message: 'Error creating payment order',
            error: error.message
        });
    }
};

/**
 * Verify payment after successful transaction
 * POST /api/payments/verify
 */
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({
                message: 'Missing required payment verification data'
            });
        }

        // Find the order
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (order.patient.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized access to this order' });
        }

        // Verify payment signature
        const isValidSignature = paymentService.verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValidSignature) {
            // Log failed verification attempt
            console.error(`❌ Payment verification failed for order ${orderId}`);

            return res.status(400).json({
                success: false,
                message: 'Payment verification failed. Invalid signature.'
            });
        }

        // Update order with payment details
        order.razorpayOrderId = razorpay_order_id;
        order.razorpayPaymentId = razorpay_payment_id;
        order.razorpaySignature = razorpay_signature;
        order.paymentStatus = 'completed';
        order.status = 'Paid';
        order.paidAt = new Date();
        order.paymentMethod = 'online';

        await order.save();

        console.log(`✅ Payment verified and order updated: ${orderId}`);

        res.json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order.orderId,
            paymentId: razorpay_payment_id,
            status: order.status
        });
    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

/**
 * Handle payment failure
 * POST /api/payments/failure
 */
exports.handleFailure = async (req, res) => {
    try {
        const { orderId, error } = req.body;

        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Find the order
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (order.patient.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized access to this order' });
        }

        // Log the error
        console.error(`❌ Payment failed for order ${orderId}:`, error);

        // Keep order in previous state (don't update to failed to allow retry)
        order.notes = order.notes
            ? `${order.notes}\n\nPayment attempt failed: ${error?.description || 'Unknown error'}`
            : `Payment attempt failed: ${error?.description || 'Unknown error'}`;

        await order.save();

        res.json({
            success: false,
            message: 'Payment failed. You can try again.',
            orderId: order.orderId
        });
    } catch (error) {
        console.error('Handle failure error:', error);
        res.status(500).json({
            message: 'Error handling payment failure',
            error: error.message
        });
    }
};

/**
 * Get payment status for an order
 * GET /api/payments/status/:orderId
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find the order
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Verify user owns this order
        if (order.patient.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Unauthorized access to this order' });
        }

        res.json({
            orderId: order.orderId,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: order.razorpayPaymentId,
            paidAt: order.paidAt,
            totalAmount: order.totalAmount
        });
    } catch (error) {
        console.error('Get payment status error:', error);
        res.status(500).json({
            message: 'Error fetching payment status',
            error: error.message
        });
    }
};
