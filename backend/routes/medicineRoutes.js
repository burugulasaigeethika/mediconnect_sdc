const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

// GET /api/medicines - Load all medicines (from local database by default)
router.get('/', medicineController.getAllMedicines);

// GET /api/medicines/search?q= - Search by name (from local database by default)
router.get('/search', medicineController.searchMedicines);

// GET /api/medicines/category/:category - Filter by category (from local database by default)
router.get('/category/:category', medicineController.getMedicinesByCategory);

// POST /api/medicines - Add new medicine (Local only)
router.post('/', medicineController.addMedicine);

module.exports = router;
