const Medicine = require('../models/Medicine');
const { fetchOGDMedicines, searchOGDMedicines } = require('../services/medicineService');

// GET /api/medicines - Load all medicines (from local database or OGD API based on source parameter)
exports.getAllMedicines = async (req, res) => {
    try {
        const { source = 'local', limit = 100 } = req.query;
        
        if (source === 'ogd') {
            // Fetch from OGD API
            const ogdData = await fetchOGDMedicines({ limit: parseInt(limit) });
            
            // Transform OGD data to match our local schema if needed
            let medicines = [];
            if (ogdData.records && Array.isArray(ogdData.records)) {
                medicines = ogdData.records.map(record => ({
                    name: record.medicine_name || record.name || 'Unknown Medicine',
                    genericName: record.generic_name || record.genericName || '',
                    manufacturer: record.manufacturer || record.company || '',
                    category: record.category || 'other',
                    description: record.description || '',
                    price: parseFloat(record.price) || parseFloat(record.mrp) || 0,
                    mrp: parseFloat(record.mrp) || parseFloat(record.price) || 0,
                    stock: 100, // Default stock
                    requiresPrescription: record.prescription_required === 'Yes' || false,
                    dosageForm: record.dosage_form || record.form || 'tablet',
                    strength: record.strength || ''
                }));
            }
            
            res.json(medicines);
        } else {
            // Fetch from local database
            const medicines = await Medicine.find().limit(parseInt(limit));
            res.json(medicines);
        }
    } catch (error) {
        console.error('Error fetching medicines:', error);
        
        // Fallback to local database if OGD API fails
        try {
            const medicines = await Medicine.find().limit(100);
            res.json(medicines);
        } catch (fallbackError) {
            res.status(500).json({ message: 'Error fetching medicines', error: error.message });
        }
    }
};

// GET /api/medicines/search?q= - Search by name (from local database or OGD API based on source parameter)
exports.searchMedicines = async (req, res) => {
    try {
        const { q, source = 'local' } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        if (source === 'ogd') {
            // Search in OGD API
            const ogdData = await searchOGDMedicines(q);
            
            // Transform OGD data to match our local schema
            let medicines = [];
            if (ogdData.records && Array.isArray(ogdData.records)) {
                medicines = ogdData.records.map(record => ({
                    name: record.medicine_name || record.name || 'Unknown Medicine',
                    genericName: record.generic_name || record.genericName || '',
                    manufacturer: record.manufacturer || record.company || '',
                    category: record.category || 'other',
                    description: record.description || '',
                    price: parseFloat(record.price) || parseFloat(record.mrp) || 0,
                    mrp: parseFloat(record.mrp) || parseFloat(record.price) || 0,
                    stock: 100, // Default stock
                    requiresPrescription: record.prescription_required === 'Yes' || false,
                    dosageForm: record.dosage_form || record.form || 'tablet',
                    strength: record.strength || ''
                }));
            }
            
            res.json(medicines);
        } else {
            // Search in local database using regex
            const medicines = await Medicine.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { genericName: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            });

            res.json(medicines);
        }
    } catch (error) {
        console.error('Error searching medicines:', error);
        
        // Fallback to local database if OGD API fails
        try {
            const { q } = req.query;
            const medicines = await Medicine.find({
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { genericName: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            });
            res.json(medicines);
        } catch (fallbackError) {
            res.status(500).json({ message: 'Error searching medicines', error: error.message });
        }
    }
};

// GET /api/medicines/category/:category - Filter by category (from local database or OGD API based on source parameter)
exports.getMedicinesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { source = 'local' } = req.query;
        
        if (source === 'ogd') {
            // For OGD API, we'll search by category in the description or name
            // This is a simplified approach - in reality, you might need to adjust based on OGD data structure
            const ogdData = await fetchOGDMedicines({
                filters: {
                    category: category
                }
            });
            
            // Transform OGD data to match our local schema
            let medicines = [];
            if (ogdData.records && Array.isArray(ogdData.records)) {
                medicines = ogdData.records.map(record => ({
                    name: record.medicine_name || record.name || 'Unknown Medicine',
                    genericName: record.generic_name || record.genericName || '',
                    manufacturer: record.manufacturer || record.company || '',
                    category: record.category || 'other',
                    description: record.description || '',
                    price: parseFloat(record.price) || parseFloat(record.mrp) || 0,
                    mrp: parseFloat(record.mrp) || parseFloat(record.price) || 0,
                    stock: 100, // Default stock
                    requiresPrescription: record.prescription_required === 'Yes' || false,
                    dosageForm: record.dosage_form || record.form || 'tablet',
                    strength: record.strength || ''
                }));
            }
            
            // Filter by category locally since OGD API filtering might not match exactly
            const filteredMedicines = medicines.filter(med => 
                med.category.toLowerCase().includes(category.toLowerCase())
            );
            
            res.json(filteredMedicines);
        } else {
            // Fetch medicines by category from local database
            const medicines = await Medicine.find({ 
                category: { $regex: category, $options: 'i' } 
            });

            res.json(medicines);
        }
    } catch (error) {
        console.error('Error fetching medicines by category:', error);
        
        // Fallback to local database if OGD API fails
        try {
            const { category } = req.params;
            const medicines = await Medicine.find({ 
                category: { $regex: category, $options: 'i' } 
            });
            res.json(medicines);
        } catch (fallbackError) {
            res.status(500).json({ message: 'Error fetching medicines by category', error: error.message });
        }
    }
};

// POST /api/medicines - Add new medicine (Local only)
exports.addMedicine = async (req, res) => {
    try {
        const medicine = new Medicine(req.body);
        await medicine.save();
        res.status(201).json({ message: 'Medicine added successfully', medicine });
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).json({ message: 'Error adding medicine', error: error.message });
    }
};