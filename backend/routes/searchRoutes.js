const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

// Public search routes
router.get('/doctors', protect, searchController.searchDoctors);
router.get('/medicines', searchController.searchMedicines);
router.get('/autocomplete', searchController.autocomplete);

// Admin indexing routes (protected)
router.post('/index/medicine/:id', protect, searchController.indexMedicine);
router.post('/index/doctor/:id', protect, searchController.indexDoctor);

module.exports = router;

