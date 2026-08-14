const Order = require('../models/Order');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const DeliveryPackage = require('../models/DeliveryPackage');
const prescriptionService = require('../services/prescriptionService');
const RecentSearchService = require('../services/recentSearchService');
const { prescriptionUploader } = require('../utils/fileUpload');

// Export upload middleware for use in routes
exports.uploadPrescriptionFile = prescriptionUploader;

// Patient uploads prescription and creates order
exports.uploadPrescription = async (req, res) => {
    try {
        console.log('=== UPLOAD PRESCRIPTION CONTROLLER CALLED ===');
        console.log('Request headers:', req.headers);
        console.log('User:', req.user);
        console.log('File:', req.file);
        console.log('Body:', req.body);

        const patientId = req.user.userId;

        // Check if file was uploaded
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'No prescription file uploaded' });
        }

        // Extract doctor details from request body
        const doctorDetails = {
            doctorName: req.body.doctorName,
            doctorRegistrationNumber: req.body.doctorRegistrationNumber,
            consultationType: req.body.consultationType,
            clinicOrHospitalName: req.body.clinicOrHospitalName,
            consultationDate: req.body.consultationDate
        };

        console.log('File uploaded successfully, calling prescription service');
        console.log('Doctor details:', doctorDetails);

        // Use prescription service to handle upload
        const order = await prescriptionService.uploadPrescription(req.file, patientId, doctorDetails);
        console.log('Prescription service response:', order);

        res.status(201).json({
            message: 'Prescription uploaded successfully',
            order
        });
    } catch (error) {
        console.error('Error uploading prescription:', error);
        res.status(500).json({ message: error.message || 'Error uploading prescription' });
    }
};

// Pharmacist gets all orders with "Pending Review" status
exports.getPendingOrders = async (req, res) => {
    try {
        const orders = await prescriptionService.getPendingOrders();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ message: error.message || 'Error fetching pending orders' });
    }
};

// Pharmacist approves prescription and adds medicines
exports.approvePrescription = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { medicines } = req.body;
        const pharmacistId = req.user.userId;

        const order = await prescriptionService.approvePrescription(orderId, medicines, pharmacistId);

        res.json({
            message: 'Prescription approved and medicines added successfully',
            order
        });
    } catch (error) {
        console.error('Error approving prescription:', error);
        res.status(500).json({ message: error.message || 'Error approving prescription' });
    }
};

// Pharmacist rejects prescription
exports.rejectPrescription = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { rejectionReason } = req.body;
        const pharmacistId = req.user.userId;

        const order = await prescriptionService.rejectPrescription(orderId, rejectionReason, pharmacistId);

        res.json({
            message: 'Prescription rejected successfully',
            order
        });
    } catch (error) {
        console.error('Error rejecting prescription:', error);
        res.status(500).json({ message: error.message || 'Error rejecting prescription' });
    }
};

// Patient makes payment
exports.makePayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentMethod, transactionId } = req.body;
        const patientId = req.user.userId;

        // Find order
        const order = await prescriptionService.getOrderDetails(orderId, patientId, 'patient');

        // Verify order is in "Approved - Awaiting Payment" status
        if (order.status !== 'Approved - Awaiting Payment') {
            return res.status(400).json({ message: 'Order is not awaiting payment' });
        }

        // Update order
        order.status = 'Paid';
        order.paymentStatus = 'completed';
        order.paymentMethod = paymentMethod;
        order.transactionId = transactionId;

        await order.save();

        res.json({
            message: 'Payment completed successfully',
            order
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: error.message || 'Error processing payment' });
    }
};

// Pharmacist updates order status to Processing
exports.startProcessing = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
        const order = await prescriptionService.getOrderDetails(orderId, null, 'pharmacist');

        // Verify order is in "Paid" status
        if (order.status !== 'Paid') {
            return res.status(400).json({ message: 'Order is not in Paid status' });
        }

        // Update order
        order.status = 'Processing';

        await order.save();

        res.json({
            message: 'Order status updated to Processing',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: error.message || 'Error updating order status' });
    }
};

// Pharmacist marks order as Ready for Dispatch
exports.markReadyForDispatch = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Find order
        const order = await prescriptionService.getOrderDetails(orderId, null, 'pharmacist');

        // Verify order is in "Processing" status
        if (order.status !== 'Processing') {
            return res.status(400).json({ message: 'Order is not in Processing status' });
        }

        // Update order
        order.status = 'Ready for Dispatch';

        await order.save();

        res.json({
            message: 'Order marked as Ready for Dispatch',
            order
        });
    } catch (error) {
        console.error('Error marking order as ready for dispatch:', error);
        res.status(500).json({ message: error.message || 'Error marking order as ready for dispatch' });
    }
};

// Get order details for patient or pharmacist
exports.getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const order = await prescriptionService.getOrderDetails(orderId, userId, userRole);
        
        // Track as recent search for pharmacist
        if (userRole === 'pharmacist' && userId) {
            await RecentSearchService.addRecentSearch(
                userId,
                'order',
                orderId,
                `Order #${order.orderId}`
            );
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ message: error.message || 'Error fetching order details' });
    }
};

// Get all orders for pharmacist
exports.getAllPharmacistOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('patient', 'name')
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });

        // Return only necessary information to pharmacist
        const pharmacistOrders = orders.map(order => ({
            _id: order._id,
            orderId: order.orderId,
            patientName: order.patient?.name || 'Unknown Patient',
            prescriptionFile: order.prescriptionFile,
            orderItems: order.orderItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            verifiedBy: order.verifiedBy?.name || null,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt
        }));

        res.json(pharmacistOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message || 'Error fetching orders' });
    }
};

// Search medicines for pharmacist
exports.searchMedicines = async (req, res) => {
    try {
        const { query } = req.query;

        let searchQuery = {};
        if (query) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { genericName: { $regex: query, $options: 'i' } }
            ];
        }

        const medicines = await Medicine.find(searchQuery)
            .select('name genericName price stock category')
            .sort({ name: 1 });

        // Track recent search if query exists and user is authenticated
        if (query && req.user && req.user.userId) {
            // Track the search term itself as a recent search
            try {
                await RecentSearchService.addRecentSearch(
                    req.user.userId,
                    'medicine',
                    `search:${query}`,
                    `Search: ${query}`
                );
            } catch (trackError) {
                console.error('Error tracking medicine search:', trackError);
            }
        }

        res.json(medicines);
    } catch (error) {
        console.error('Error searching medicines:', error);
        res.status(500).json({ message: error.message || 'Error searching medicines' });
    }
};

// Get orders for logged-in patient
exports.getPatientOrders = async (req, res) => {
    try {
        const patientId = req.user.userId;
        const orders = await Order.find({ patient: patientId })
            .select('orderId status createdAt totalAmount prescriptionFile')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching patient orders:', error);
        res.status(500).json({ message: error.message || 'Error fetching orders' });
    }
};

module.exports = {

    uploadPrescriptionFile: exports.uploadPrescriptionFile,
    uploadPrescription: exports.uploadPrescription,
    getPendingOrders: exports.getPendingOrders,
    approvePrescription: exports.approvePrescription,
    rejectPrescription: exports.rejectPrescription,
    makePayment: exports.makePayment,
    startProcessing: exports.startProcessing,
    markReadyForDispatch: exports.markReadyForDispatch,
    getOrderDetails: exports.getOrderDetails,
    getAllPharmacistOrders: exports.getAllPharmacistOrders,
    getAllPharmacistOrders: exports.getAllPharmacistOrders,
    searchMedicines: exports.searchMedicines,
    getPatientOrders: exports.getPatientOrders
};