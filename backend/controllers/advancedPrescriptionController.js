const advancedPrescriptionService = require('../services/advancedPrescriptionService');
const { prescriptionUploader } = require('../utils/fileUpload');

// Export upload middleware for use in routes
exports.uploadPrescriptionFile = prescriptionUploader;

/**
 * Create a new prescription
 */
exports.createPrescription = async (req, res) => {
    try {
        const { patientId, doctorId, ...prescriptionData } = req.body;
        const requesterId = req.user.userId;
        const requesterRole = req.user.role;

        // Validate requester permissions
        if (requesterRole === 'patient' && requesterId !== patientId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (requesterRole === 'doctor' && requesterId !== doctorId) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const prescription = await advancedPrescriptionService.createPrescription(
            prescriptionData,
            patientId,
            doctorId
        );

        res.status(201).json({
            message: 'Prescription created successfully',
            prescription
        });
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ message: error.message || 'Error creating prescription' });
    }
};

/**
 * Upload prescription file
 */
exports.uploadFile = async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Verify prescription ownership
        const prescription = await advancedPrescriptionService.getPatientPrescriptions(
            req.user.userId
        );

        if (!prescription.some(rx => rx._id.toString() === prescriptionId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedPrescription = await advancedPrescriptionService.uploadPrescriptionFile(
            req.file,
            prescriptionId
        );

        res.status(200).json({
            message: 'Prescription file uploaded successfully',
            prescription: updatedPrescription
        });
    } catch (error) {
        console.error('Error uploading prescription file:', error);
        res.status(500).json({ message: error.message || 'Error uploading prescription file' });
    }
};

/**
 * Get patient prescriptions
 */
exports.getPatientPrescriptions = async (req, res) => {
    try {
        const { status } = req.query;
        const prescriptions = await advancedPrescriptionService.getPatientPrescriptions(
            req.user.userId,
            status
        );

        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: error.message || 'Error fetching prescriptions' });
    }
};

/**
 * Get doctor prescriptions
 */
exports.getDoctorPrescriptions = async (req, res) => {
    try {
        const { status } = req.query;
        const prescriptions = await advancedPrescriptionService.getDoctorPrescriptions(
            req.user.userId,
            status
        );

        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: error.message || 'Error fetching prescriptions' });
    }
};

/**
 * Review prescription (pharmacist only)
 */
exports.reviewPrescription = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { action, ...reviewData } = req.body;
        const pharmacistId = req.user.userId;

        const prescription = await advancedPrescriptionService.reviewPrescription(
            prescriptionId,
            pharmacistId,
            action,
            reviewData
        );

        res.json({
            message: `Prescription ${action}d successfully`,
            prescription
        });
    } catch (error) {
        console.error('Error reviewing prescription:', error);
        res.status(500).json({ message: error.message || 'Error reviewing prescription' });
    }
};

/**
 * Archive old prescriptions
 */
exports.archiveOldPrescriptions = async (req, res) => {
    try {
        const { daysOld = 365 } = req.query;
        const archivedCount = await advancedPrescriptionService.archiveOldPrescriptions(daysOld);

        res.json({
            message: `Successfully archived ${archivedCount} prescriptions`,
            archivedCount
        });
    } catch (error) {
        console.error('Error archiving prescriptions:', error);
        res.status(500).json({ message: error.message || 'Error archiving prescriptions' });
    }
};