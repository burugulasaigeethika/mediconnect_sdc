const User = require('../models/User');
const Medicine = require('../models/Medicine');
// const Prescription = require('../models/Prescription'); // UNUSED
// const PrescriptionOrder = require('../models/PrescriptionOrder'); // UNUSED
const Order = require('../models/Order'); // USING ORDER MODEL
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const RecentSearchService = require('../services/recentSearchService');
const { sendOTPEmail } = require('../services/emailService');
const { sendOrderStatusNotification } = require('../services/notificationService');

// Pharmacist Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find pharmacist user
        const user = await User.findOne({ email, role: 'pharmacist' });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials or not a pharmacist' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
                pharmacyName: user.pharmacyName,
                licenseNumber: user.licenseNumber
            }
        });
    } catch (error) {
        console.error('Pharmacist login error:', error);
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

// Get all prescriptions for review (Orders with status 'Pending Review')
exports.getPrescriptionsForReview = async (req, res) => {
    try {
        // Query Order model instead of Prescription
        const prescriptions = await Order.find({ status: 'Pending Review' })
            .populate('patient', 'name email phone')
            .sort({ createdAt: -1 });

        // Map to format expected by frontend if necessary, or just return orders
        // Providing extra context fields if they exist in schema
        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Error fetching prescriptions', error: error.message });
    }
};

// Approve prescription
exports.approvePrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params; // logic expects orderId or _id
        const { pharmacistNotes } = req.body;

        // Use custom orderId logic from prescriptionService or update Order directly
        // Assuming prescriptionId here refers to the _id of the Order
        const order = await Order.findById(prescriptionId) || await Order.findOne({ orderId: prescriptionId });

        if (!order) {
            return res.status(404).json({ message: 'Prescription Order not found' });
        }

        // Update prescription status
        order.status = 'Approved - Awaiting Payment'; // Matches Order model enum
        order.notes = pharmacistNotes;
        order.verifiedBy = req.user.userId;

        await order.save();

        res.json({
            message: 'Prescription approved successfully',
            prescription: order // returning as 'prescription' to maintain frontend compatibility if needed
        });
    } catch (error) {
        console.error('Error approving prescription:', error);
        res.status(500).json({ message: 'Error approving prescription', error: error.message });
    }
};

// Reject prescription
exports.rejectPrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { rejectionReason, pharmacistNotes } = req.body;

        const order = await Order.findById(prescriptionId) || await Order.findOne({ orderId: prescriptionId });

        if (!order) {
            return res.status(404).json({ message: 'Prescription Order not found' });
        }

        // Update prescription status
        order.status = 'Rejected';
        order.notes = pharmacistNotes ? `${pharmacistNotes}. Reason: ${rejectionReason}` : rejectionReason;
        order.verifiedBy = req.user.userId;

        await order.save();

        res.json({
            message: 'Prescription rejected successfully',
            prescription: order
        });
    } catch (error) {
        console.error('Error rejecting prescription:', error);
        res.status(500).json({ message: 'Error rejecting prescription', error: error.message });
    }
};

// Get all prescription orders (All Orders)
exports.getPrescriptionOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('patient', 'name email phone')
            .populate('verifiedBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching prescription orders:', error);
        res.status(500).json({ message: 'Error fetching prescription orders', error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // This might be _id or custom orderId
        const { status, notes } = req.body;

        // Find order by _id or custom orderId
        let order = await Order.findById(orderId);
        if (!order) {
            order = await Order.findOne({ orderId: orderId });
        }

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status - ensure matching Order enum
        // ['Pending Review', 'Approved - Awaiting Payment', 'Paid', 'Processing', 'Ready for Dispatch', 'Completed', 'Rejected']
        // Map simplified status if needed
        let orderStatus = status;
        if (status === 'Pending') orderStatus = 'Pending Review';
        if (status === 'Approved') orderStatus = 'Approved - Awaiting Payment';

        order.status = orderStatus;
        if (notes) {
            order.notes = notes;
        }

        if (!order.verifiedBy) {
            order.verifiedBy = req.user.userId;
        }

        await order.save();

        // Send notification to patient
        if (order.patient) {
            try {
                await sendOrderStatusNotification(orderId, order.patient, orderStatus, notes || '');
            } catch (notificationError) {
                console.error('Error sending notification:', notificationError);
            }
        }

        res.json({
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
};

// Get all medicines (inventory)
exports.getMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find().sort({ name: 1 });
        res.json(medicines);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).json({ message: 'Error fetching medicines', error: error.message });
    }
};

// Get single medicine by ID and track as recent search
exports.getMedicineById = async (req, res) => {
    try {
        const { medicineId } = req.params;
        
        // Find medicine
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }
        
        // Track as recent search for pharmacist
        if (req.user && req.user.userId) {
            await RecentSearchService.addRecentSearch(
                req.user.userId,
                'medicine',
                medicineId,
                medicine.name
            );
        }
        
        res.json(medicine);
    } catch (error) {
        console.error('Error fetching medicine:', error);
        res.status(500).json({ message: 'Error fetching medicine', error: error.message });
    }
};

// Add new medicine
exports.addMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        res.status(201).json({
            message: 'Medicine added successfully',
            medicine
        });
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).json({ message: 'Error adding medicine', error: error.message });
    }
};

// Update medicine
exports.updateMedicine = async (req, res) => {
    try {
        const { medicineId } = req.params;

        // Find medicine
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Update medicine
        Object.keys(req.body).forEach(key => {
            medicine[key] = req.body[key];
        });

        await medicine.save();

        res.json({
            message: 'Medicine updated successfully',
            medicine
        });
    } catch (error) {
        console.error('Error updating medicine:', error);
        res.status(500).json({ message: 'Error updating medicine', error: error.message });
    }
};

// Delete medicine
exports.deleteMedicine = async (req, res) => {
    try {
        const { medicineId } = req.params;

        // Check if medicine exists
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: 'Medicine not found' });
        }

        // Check if medicine is linked with any orders/prescriptions
        const orderCount = await Order.countDocuments({
            'orderItems.medicine': medicineId
        });

        if (orderCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete medicine as it is linked with existing prescriptions/orders' 
            });
        }

        // Delete medicine
        await Medicine.findByIdAndDelete(medicineId);

        res.json({
            message: 'Medicine deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Error deleting medicine', error: error.message });
    }
};

// Get pharmacist dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        // Count from Order model
        const stats = {
            totalOrders: await Order.countDocuments(),
            pendingOrders: await Order.countDocuments({ status: 'Pending Review' }),
            approvedOrders: await Order.countDocuments({ status: 'Approved - Awaiting Payment' }),
            rejectedOrders: await Order.countDocuments({ status: 'Rejected' }),
            processingOrders: await Order.countDocuments({ status: 'Processing' }),
            readyForDispatchOrders: await Order.countDocuments({ status: 'Ready for Dispatch' }),
            completedOrders: await Order.countDocuments({ status: 'Completed' }),
            totalMedicines: await Medicine.countDocuments(),
            outOfStockMedicines: await Medicine.countDocuments({ stock: 0 }),
            expiringSoonMedicines: await Medicine.countDocuments({
                expiryDate: {
                    $lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                },
                stock: { $gt: 0 }
            })
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
    }
};

// Get pharmacist by ID
exports.getPharmacistById = async (req, res) => {
    try {
        const { pharmacistId } = req.params;

        // Security check: Only allow pharmacists to view their own profile
        // unless they are an admin
        if (req.user.userId !== pharmacistId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
        }

        // Find pharmacist user
        const user = await User.findOne({ _id: pharmacistId, role: 'pharmacist' });
        if (!user) {
            return res.status(404).json({ message: 'Pharmacist not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            pharmacyName: user.pharmacyName,
            licenseNumber: user.licenseNumber,
            address: user.address
        });
    } catch (error) {
        console.error('Error fetching pharmacist:', error);
        res.status(500).json({ message: 'Error fetching pharmacist', error: error.message });
    }
};

// Update pharmacist profile
exports.updatePharmacistProfile = async (req, res) => {
    try {
        const { pharmacistId } = req.params;
        const { name, phone, pharmacyName, licenseNumber, address } = req.body;

        // Security check: Only allow pharmacists to update their own profile
        // unless they are an admin
        if (req.user.userId !== pharmacistId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
        }

        // Find pharmacist user
        const user = await User.findOne({ _id: pharmacistId, role: 'pharmacist' });
        if (!user) {
            return res.status(404).json({ message: 'Pharmacist not found' });
        }

        // Update user fields
        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.pharmacyName = pharmacyName || user.pharmacyName;
        user.licenseNumber = licenseNumber || user.licenseNumber;
        user.address = address || user.address;

        await user.save();

        res.json({
            message: 'Pharmacist profile updated successfully',
            pharmacist: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                pharmacyName: user.pharmacyName,
                licenseNumber: user.licenseNumber,
                address: user.address
            }
        });
    } catch (error) {
        console.error('Error updating pharmacist profile:', error);
        res.status(500).json({ message: 'Error updating pharmacist profile', error: error.message });
    }
};
