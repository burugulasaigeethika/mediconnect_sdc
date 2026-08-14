/**
 * Prescription Service
 * Handles business logic for prescription management
 */

const Order = require('../models/Order');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const cloudStorageService = require('./cloudStorageService');
const { v4: uuidv4 } = require('uuid');

class PrescriptionService {
    /**
     * Upload prescription and create order
     * @param {Object} file - Uploaded file object
     * @param {String} patientId - Patient ID
     * @param {Object} doctorDetails - Doctor details (optional)
     * @returns {Promise<Object>} - Created order
     */
    async uploadPrescription(file, patientId, doctorDetails = {}) {
        try {
            console.log('PrescriptionService: uploadPrescription called with file:', file);
            console.log('PrescriptionService: patientId:', patientId);
            console.log('PrescriptionService: doctorDetails:', doctorDetails);

            // Get patient details
            const patient = await User.findById(patientId);
            console.log('PrescriptionService: patient found:', patient);

            if (!patient) {
                throw new Error('Patient not found');
            }

            // Upload file to cloud storage
            console.log('PrescriptionService: Uploading file to cloud storage');
            const fileData = await cloudStorageService.uploadFile(file, 'prescriptions');
            console.log('PrescriptionService: File uploaded, fileData:', fileData);

            // Generate unique order ID
            const orderId = this.generateOrderId();
            console.log('PrescriptionService: Generated orderId:', orderId);

            // Create new order with "Pending Review" status
            const orderData = {
                orderId: orderId,
                patient: patientId,
                prescriptionFile: fileData.url,
                prescriptionFileKey: fileData.key || fileData.filename,
                orderItems: [],
                status: 'Pending Review'
            };

            // Add doctor details if provided
            if (doctorDetails.doctorName) {
                orderData.doctorName = doctorDetails.doctorName;
            }
            if (doctorDetails.doctorRegistrationNumber) {
                orderData.doctorRegistrationNumber = doctorDetails.doctorRegistrationNumber;
            }
            if (doctorDetails.consultationType) {
                orderData.consultationType = doctorDetails.consultationType;
            }
            if (doctorDetails.clinicOrHospitalName) {
                orderData.clinicOrHospitalName = doctorDetails.clinicOrHospitalName;
            }
            if (doctorDetails.consultationDate) {
                orderData.consultationDate = doctorDetails.consultationDate;
            }

            // Only add delivery address if patient has a complete address
            if (patient.address && patient.address.street && patient.address.city && patient.address.state && patient.address.zipCode) {
                orderData.deliveryAddress = patient.address;
            }

            const order = new Order(orderData);

            console.log('PrescriptionService: Saving order:', order);

            await order.save();
            console.log('PrescriptionService: Order saved successfully');

            return order;
        } catch (error) {
            console.error('Error in uploadPrescription:', error);
            throw error;
        }
    }

    /**
     * Get order details
     * @param {String} orderId - Order ID
     * @param {String} userId - User ID
     * @param {String} userRole - User role
     * @returns {Promise<Object>} - Order details
     */
    async getOrderDetails(orderId, userId, userRole) {
        try {
            const order = await Order.findOne({ orderId })
                .populate('patient', 'name')
                .populate('verifiedBy', 'name')
                .populate('orderItems.medicine');

            if (!order) {
                throw new Error('Order not found');
            }

            // Verify access rights
            if (userRole === 'patient' && order.patient._id.toString() !== userId) {
                throw new Error('Access denied');
            }

            return order;
        } catch (error) {
            console.error('Error in getOrderDetails:', error);
            throw error;
        }
    }

    /**
     * Get pending orders for pharmacist
     * @returns {Promise<Array>} - Pending orders
     */
    async getPendingOrders() {
        try {
            const orders = await Order.find({ status: 'Pending Review' })
                .populate('patient', 'name')
                .sort({ createdAt: -1 });

            // Return only necessary information to pharmacist
            return orders.map(order => ({
                _id: order._id,
                orderId: order.orderId,
                patientId: order.patient?._id,
                patientName: order.patient?.name || 'Unknown Patient',
                prescriptionFile: order.prescriptionFile,
                status: order.status,
                createdAt: order.createdAt,
                // Include doctor details
                doctorName: order.doctorName,
                doctorRegistrationNumber: order.doctorRegistrationNumber,
                consultationType: order.consultationType,
                clinicOrHospitalName: order.clinicOrHospitalName,
                consultationDate: order.consultationDate
            }));
        } catch (error) {
            console.error('Error in getPendingOrders:', error);
            throw error;
        }
    }

    /**
     * Approve prescription and add medicines
     * @param {String} orderId - Order ID
     * @param {Array} medicines - Medicines to add
     * @param {String} pharmacistId - Pharmacist ID
     * @returns {Promise<Object>} - Updated order
     */
    async approvePrescription(orderId, medicines, pharmacistId) {
        try {
            const order = await Order.findOne({ orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            // Verify order is in "Pending Review" status
            if (order.status !== 'Pending Review') {
                throw new Error('Order is not in Pending Review status');
            }

            // Process medicines
            let totalAmount = 0;
            const orderItems = [];

            for (const item of medicines) {
                const medicine = await Medicine.findById(item.medicineId);
                if (!medicine) {
                    throw new Error(`Medicine ${item.medicineId} not found`);
                }

                // Check stock
                if (medicine.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${medicine.name}. Available: ${medicine.stock}, Requested: ${item.quantity}`);
                }

                orderItems.push({
                    medicine: medicine._id,
                    name: medicine.name,
                    quantity: item.quantity,
                    price: item.price || medicine.price
                });

                totalAmount += (item.price || medicine.price) * item.quantity;
            }

            // Update order
            order.orderItems = orderItems;
            order.totalAmount = totalAmount;
            order.status = 'Approved - Awaiting Payment';
            order.verifiedBy = pharmacistId;

            await order.save();

            return order;
        } catch (error) {
            console.error('Error in approvePrescription:', error);
            throw error;
        }
    }

    /**
     * Reject prescription
     * @param {String} orderId - Order ID
     * @param {String} rejectionReason - Reason for rejection
     * @param {String} pharmacistId - Pharmacist ID
     * @returns {Promise<Object>} - Updated order
     */
    async rejectPrescription(orderId, rejectionReason, pharmacistId) {
        try {
            const order = await Order.findOne({ orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            // Verify order is in "Pending Review" status
            if (order.status !== 'Pending Review') {
                throw new Error('Order is not in Pending Review status');
            }

            // Update order
            order.status = 'Rejected';
            order.notes = rejectionReason;
            order.verifiedBy = pharmacistId;

            await order.save();

            return order;
        } catch (error) {
            console.error('Error in rejectPrescription:', error);
            throw error;
        }
    }

    /**
     * Generate unique order ID
     * @returns {String} - Unique order ID
     */
    generateOrderId() {
        return 'ORD-' + Date.now() + '-' + uuidv4().substring(0, 8).toUpperCase();
    }

    /**
     * Delete prescription file
     * @param {String} fileKey - File key in storage
     * @returns {Promise<Boolean>} - Success status
     */
    async deletePrescriptionFile(fileKey) {
        try {
            return await cloudStorageService.deleteFile(fileKey);
        } catch (error) {
            console.error('Error in deletePrescriptionFile:', error);
            return false;
        }
    }
}

module.exports = new PrescriptionService();