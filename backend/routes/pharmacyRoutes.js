const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const { authMiddleware, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Get all medicines
router.get('/medicines', async (req, res) => {
    try {
        const { category, search } = req.query;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { genericName: { $regex: search, $options: 'i' } }
            ];
        }

        const medicines = await Medicine.find(query).sort({ name: 1 });
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Error fetching medicines', error: error.message });
    }
});

// Get medicine by ID
router.get('/medicines/:id', async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.json(medicine);
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({ message: 'Error fetching medicine', error: error.message });
    }
});

// Create medicine (pharmacist/admin only)
router.post('/medicines', authMiddleware, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();

        res.status(201).json({
            message: 'Medicine added successfully',
            medicine
        });
    } catch (error) {
        console.error('Error creating medicine:', error);
        res.status(500).json({ message: 'Error creating medicine', error: error.message });
    }
});

// Update medicine (pharmacist/admin only)
router.put('/medicines/:id', authMiddleware, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const medicine = await Medicine.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        res.json({ message: 'Medicine updated successfully', medicine });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Error updating medicine', error: error.message });
    }
});

// Create order (Direct Purchase)
router.post('/orders', authMiddleware, async (req, res) => {
    try {
        const { items, deliveryAddress } = req.body;

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const medicine = await Medicine.findById(item.medicine);
            if (!medicine) {
                return res.status(404).json({ message: `Medicine ${item.medicine} not found` });
            }

            if (medicine.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
            }

            orderItems.push({
                medicine: medicine._id,
                name: medicine.name,
                quantity: item.quantity,
                price: medicine.price
            });

            totalAmount += medicine.price * item.quantity;
        }

        // Generate unique order ID
        const orderId = 'ORD-' + Date.now() + '-' + uuidv4().substring(0, 8).toUpperCase();

        const order = new Order({
            orderId,
            patient: req.user.userId,
            orderItems, // Correct field name
            totalAmount,
            deliveryAddress,
            status: 'Approved - Awaiting Payment' // Direct orders skip review
        });

        await order.save();

        // Populate for response
        await order.populate('orderItems.medicine', 'name price');

        res.status(201).json({
            message: 'Order placed successfully',
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// Get user orders (merged logic)
router.get('/orders', authMiddleware, async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'patient') {
            query.patient = req.user.userId;
        }

        const orders = await Order.find(query)
            .populate('patient', 'name email phone')
            .populate('orderItems.medicine', 'name price')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
});

// Update order status (pharmacist only)
router.put('/orders/:id', authMiddleware, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const { status } = req.body;

        // Map frontend/legacy status to Unified Enum if needed, or enforce enum
        // Valid: 'Pending Review', 'Approved - Awaiting Payment', 'Paid', 'Processing', 'Ready for Dispatch', 'Completed', 'Rejected'

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status,
                verifiedBy: req.user.userId
            },
            { new: true }
        )
            .populate('patient', 'name email phone')
            .populate('orderItems.medicine', 'name price');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update medicine stock if order is completed or dispatched (logic can vary)
        if (status === 'Completed' || status === 'Ready for Dispatch') {
            // Basic stock deduction logic - strictly usually done at 'Approved' or 'Paid' to reserve stock
            // For now, leaving stock logic to specific controller actions to avoid double deduction
        }

        res.json({ message: 'Order updated successfully', order });
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Error updating order', error: error.message });
    }
});

// Create Payment Order
router.post('/create-payment-order', authMiddleware, async (req, res) => {
    try {
        const { amount } = req.body;
        const { createOrder } = require('../services/paymentService');

        const order = await createOrder(amount);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error creating payment order:', error);
        res.status(500).json({ message: 'Error creating payment order', error: error.message });
    }
});

// Verify Payment and Confirm Order
router.post('/verify-payment', authMiddleware, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Internal DB Order ID
        } = req.body;

        const { verifyPayment } = require('../services/paymentService');

        const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update Order Status
        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentStatus: 'paid',
                paymentMethod: 'razorpay',
                transactionId: razorpay_payment_id,
                status: 'confirmed'
            },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Payment verified and order confirmed',
            order
        });
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
});

// Validate prescription (Pharmacist)
router.post('/prescriptions/validate', authMiddleware, authorize('pharmacist', 'admin'), async (req, res) => {
    try {
        const { prescriptionId, status, pharmacyNotes } = req.body;
        const Prescription = require('../models/Prescription');

        const prescription = await Prescription.findByIdAndUpdate(
            prescriptionId,
            {
                status, // 'approved' or 'rejected'
                pharmacyNotes
            },
            { new: true }
        );

        res.json({ message: 'Prescription validated', prescription });
    } catch (error) {
        console.error('Error validating prescription:', error);
        res.status(500).json({ message: 'Error validating prescription' });
    }
});

module.exports = router;
