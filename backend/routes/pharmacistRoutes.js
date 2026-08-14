const express = require('express');
const router = express.Router();
const pharmacistController = require('../controllers/pharmacistController');
const { authMiddleware, authorize } = require('../middleware/auth');

// Pharmacist Login (no auth required for login)
router.post('/login', pharmacistController.login);

// Apply auth middleware to all other routes
router.use(authMiddleware, authorize('pharmacist'));

// Dashboard stats
router.get('/dashboard/stats', pharmacistController.getDashboardStats);

// Prescription management
router.get('/prescriptions', pharmacistController.getPrescriptionsForReview);
router.patch('/prescriptions/:prescriptionId/approve', pharmacistController.approvePrescription);
router.patch('/prescriptions/:prescriptionId/reject', pharmacistController.rejectPrescription);

// Prescription order management
router.get('/orders', pharmacistController.getPrescriptionOrders);
router.patch('/orders/:orderId/status', pharmacistController.updateOrderStatus);

// Inventory management
router.get('/medicines', pharmacistController.getMedicines);
router.get('/medicines/:medicineId', pharmacistController.getMedicineById);
router.post('/medicines', pharmacistController.addMedicine);
router.put('/medicines/:medicineId', pharmacistController.updateMedicine);
router.delete('/medicines/:medicineId', pharmacistController.deleteMedicine);

// Pharmacist profile management
router.get('/profile/:pharmacistId', pharmacistController.getPharmacistById);
router.put('/profile/:pharmacistId', pharmacistController.updatePharmacistProfile);

module.exports = router;