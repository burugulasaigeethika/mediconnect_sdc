/**
 * Advanced Prescription Service
 * Enhanced service for handling prescription management with advanced features
 */

const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const cloudStorageService = require('./cloudStorageService');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class AdvancedPrescriptionService {
    /**
     * Create a new prescription
     * @param {Object} prescriptionData - Prescription data
     * @param {String} patientId - Patient ID
     * @param {String} doctorId - Doctor ID (optional)
     * @returns {Promise<Object>} - Created prescription
     */
    async createPrescription(prescriptionData, patientId, doctorId = null) {
        try {
            // Generate unique prescription ID
            const prescriptionId = this.generatePrescriptionId();

            // Create prescription object
            const prescriptionObj = {
                prescriptionId,
                patient: patientId,
                ...prescriptionData
            };

            // Add doctor if provided
            if (doctorId) {
                prescriptionObj.doctor = doctorId;
            }

            // Set validity period (default 30 days)
            const validFrom = new Date();
            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + 30);

            prescriptionObj.validFrom = validFrom;
            prescriptionObj.validUntil = validUntil;

            const prescription = new Prescription(prescriptionObj);
            await prescription.save();

            return prescription;
        } catch (error) {
            console.error('Error in createPrescription:', error);
            throw error;
        }
    }

    /**
     * Upload prescription file and link to existing prescription
     * @param {Object} file - Uploaded file object
     * @param {String} prescriptionId - Prescription ID
     * @returns {Promise<Object>} - Updated prescription
     */
    async uploadPrescriptionFile(file, prescriptionId) {
        try {
            // Upload file to cloud storage
            const fileData = await cloudStorageService.uploadFile(file, 'prescriptions');

            // Update prescription with file information
            const prescription = await Prescription.findByIdAndUpdate(
                prescriptionId,
                {
                    prescriptionImageUrl: fileData.url,
                    prescriptionFileKey: fileData.key || fileData.filename
                },
                { new: true }
            );

            if (!prescription) {
                throw new Error('Prescription not found');
            }

            return prescription;
        } catch (error) {
            console.error('Error in uploadPrescriptionFile:', error);
            throw error;
        }
    }

    /**
     * Get prescriptions for a patient
     * @param {String} patientId - Patient ID
     * @param {String} status - Filter by status (optional)
     * @returns {Promise<Array>} - Patient prescriptions
     */
    async getPatientPrescriptions(patientId, status = null) {
        try {
            let query = { patient: patientId };

            if (status) {
                query.status = status;
            }

            const prescriptions = await Prescription.find(query)
                .populate('doctor', 'name specialization')
                .populate('reviewedBy', 'name')
                .sort({ createdAt: -1 });

            return prescriptions;
        } catch (error) {
            console.error('Error in getPatientPrescriptions:', error);
            throw error;
        }
    }

    /**
     * Get prescriptions for a doctor
     * @param {String} doctorId - Doctor ID
     * @param {String} status - Filter by status (optional)
     * @returns {Promise<Array>} - Doctor prescriptions
     */
    async getDoctorPrescriptions(doctorId, status = null) {
        try {
            let query = { doctor: doctorId };

            if (status) {
                query.status = status;
            }

            const prescriptions = await Prescription.find(query)
                .populate('patient', 'name email phone')
                .populate('reviewedBy', 'name')
                .sort({ createdAt: -1 });

            return prescriptions;
        } catch (error) {
            console.error('Error in getDoctorPrescriptions:', error);
            throw error;
        }
    }

    /**
     * Review prescription
     * @param {String} prescriptionId - Prescription ID
     * @param {String} pharmacistId - Pharmacist ID
     * @param {String} action - Action to take (approve/reject)
     * @param {Object} reviewData - Review data (medicines, notes, etc.)
     * @returns {Promise<Object>} - Updated prescription
     */
    async reviewPrescription(prescriptionId, pharmacistId, action, reviewData = {}) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                throw new Error('Prescription not found');
            }

            // Check if prescription is already reviewed
            if (prescription.status !== 'Pending Review') {
                throw new Error('Prescription has already been reviewed');
            }

            // Check if prescription is expired
            if (prescription.validUntil && new Date() > prescription.validUntil) {
                throw new Error('Prescription has expired');
            }

            // Update prescription based on action
            if (action === 'approve') {
                prescription.status = 'Approved';
                prescription.medicines = reviewData.medicines || [];
            } else if (action === 'reject') {
                prescription.status = 'Rejected';
                prescription.rejectionReason = reviewData.reason || 'Not specified';
            } else {
                throw new Error('Invalid action. Use "approve" or "reject"');
            }

            prescription.reviewedBy = pharmacistId;
            prescription.reviewedAt = new Date();

            // Add digital signature for authenticity
            prescription.digitalSignature = this.generateDigitalSignature(prescription);

            await prescription.save();

            // If approved, create order
            if (action === 'approve') {
                await this.createOrderFromPrescription(prescription, pharmacistId);
            }

            return prescription;
        } catch (error) {
            console.error('Error in reviewPrescription:', error);
            throw error;
        }
    }

    /**
     * Create order from approved prescription
     * @param {Object} prescription - Prescription object
     * @param {String} pharmacistId - Pharmacist ID
     * @returns {Promise<Object>} - Created order
     */
    async createOrderFromPrescription(prescription, pharmacistId) {
        try {
            // Get patient details
            const patient = await User.findById(prescription.patient);
            if (!patient) {
                throw new Error('Patient not found');
            }

            // Calculate total amount
            let totalAmount = 0;
            const orderItems = prescription.medicines.map(med => {
                totalAmount += med.price * med.quantity;
                return {
                    medicine: med.medicine,
                    name: med.name,
                    quantity: med.quantity,
                    price: med.price
                };
            });

            // Generate order ID
            const orderId = this.generateOrderId();

            // Create order
            const order = new Order({
                orderId,
                patient: prescription.patient,
                prescription: prescription._id,
                prescriptionFile: prescription.prescriptionImageUrl,
                orderItems,
                totalAmount,
                status: 'Approved - Awaiting Payment',
                deliveryAddress: patient.address || {},
                verifiedBy: pharmacistId
            });

            await order.save();

            return order;
        } catch (error) {
            console.error('Error in createOrderFromPrescription:', error);
            throw error;
        }
    }

    /**
     * Generate digital signature for prescription
     * @param {Object} prescription - Prescription object
     * @returns {String} - Digital signature
     */
    generateDigitalSignature(prescription) {
        const dataToSign = `${prescription._id}${prescription.status}${prescription.reviewedBy}${prescription.reviewedAt}`;
        const secret = process.env.PRESCRIPTION_SIGNATURE_SECRET || 'default-secret-key';
        return crypto.createHmac('sha256', secret)
            .update(dataToSign)
            .digest('hex');
    }

    /**
     * Generate unique prescription ID
     * @returns {String} - Unique prescription ID
     */
    generatePrescriptionId() {
        return 'RX-' + Date.now() + '-' + uuidv4().substring(0, 8).toUpperCase();
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

    /**
     * Archive old prescriptions
     * @param {Number} daysOld - Age of prescriptions to archive (in days)
     * @returns {Promise<Number>} - Number of archived prescriptions
     */
    async archiveOldPrescriptions(daysOld = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await Prescription.updateMany(
                {
                    status: { $in: ['Approved', 'Rejected'] },
                    createdAt: { $lt: cutoffDate },
                    status: { $ne: 'Archived' }
                },
                { status: 'Archived' }
            );

            return result.modifiedCount;
        } catch (error) {
            console.error('Error in archiveOldPrescriptions:', error);
            throw error;
        }
    }
}

module.exports = new AdvancedPrescriptionService();