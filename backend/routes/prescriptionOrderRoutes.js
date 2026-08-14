const express = require('express');
const router = express.Router();
const prescriptionOrderController = require('../controllers/prescriptionOrderController');
const { authMiddleware, authorize } = require('../middleware/auth');

// Test endpoint to verify route is working
router.get('/test', (req, res) => {
    res.json({ message: 'Prescription orders route is working' });
});

// Pharmacist routes - Specific routes must come before parameterized routes
router.get('/pending', authMiddleware, authorize('pharmacist'), prescriptionOrderController.getPendingOrders);
router.get('/all', authMiddleware, authorize('pharmacist'), prescriptionOrderController.getAllPharmacistOrders);
router.get('/medicines/search', authMiddleware, authorize('pharmacist'), prescriptionOrderController.searchMedicines);

// Patient routes
router.post('/upload-prescription', authMiddleware, authorize('patient'), prescriptionOrderController.uploadPrescriptionFile, prescriptionOrderController.uploadPrescription);
router.get('/patient/my-orders', authMiddleware, authorize('patient'), prescriptionOrderController.getPatientOrders);
router.post('/:orderId/pay', authMiddleware, authorize('patient'), prescriptionOrderController.makePayment);
router.get('/:orderId', authMiddleware, authorize('patient', 'pharmacist'), prescriptionOrderController.getOrderDetails);

// Pharmacist routes - Parameterized routes
router.patch('/:orderId/approve', authMiddleware, authorize('pharmacist'), prescriptionOrderController.approvePrescription);
router.patch('/:orderId/reject', authMiddleware, authorize('pharmacist'), prescriptionOrderController.rejectPrescription);
router.patch('/:orderId/start-processing', authMiddleware, authorize('pharmacist'), prescriptionOrderController.startProcessing);
router.patch('/:orderId/ready-for-dispatch', authMiddleware, authorize('pharmacist'), prescriptionOrderController.markReadyForDispatch);

module.exports = router;