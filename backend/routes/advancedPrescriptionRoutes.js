const express = require('express');
const router = express.Router();
const advancedPrescriptionController = require('../controllers/advancedPrescriptionController');
const { authMiddleware, authorize } = require('../middleware/auth');

// Patient routes
router.post('/', authMiddleware, authorize('patient', 'doctor'), advancedPrescriptionController.createPrescription);
router.post('/:prescriptionId/upload', authMiddleware, authorize('patient'), advancedPrescriptionController.uploadPrescriptionFile, advancedPrescriptionController.uploadFile);
router.get('/patient', authMiddleware, authorize('patient'), advancedPrescriptionController.getPatientPrescriptions);

// Doctor routes
router.get('/doctor', authMiddleware, authorize('doctor'), advancedPrescriptionController.getDoctorPrescriptions);

// Pharmacist routes
router.patch('/:prescriptionId/review', authMiddleware, authorize('pharmacist'), advancedPrescriptionController.reviewPrescription);

// Admin routes
router.post('/archive', authMiddleware, authorize('admin'), advancedPrescriptionController.archiveOldPrescriptions);

module.exports = router;