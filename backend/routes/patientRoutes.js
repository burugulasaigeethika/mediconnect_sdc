const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prescription = require('../models/Prescription');
const auth = require('../middleware/auth'); // Assuming you have this or will create it

// Search doctors
router.get('/doctors/search', async (req, res) => {
    try {
        const { query, specialty, location } = req.query;
        let searchCriteria = { role: 'doctor' };

        if (query) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { specialization: { $regex: query, $options: 'i' } }
            ];
        }

        if (specialty) {
            searchCriteria.specialization = { $regex: specialty, $options: 'i' };
        }

        // Location search would typically require geospatial queries or simple string match on address
        if (location) {
            searchCriteria['address.city'] = { $regex: location, $options: 'i' };
        }

        const doctors = await User.find(searchCriteria)
            .select('-password -medicalHistory -appointments'); // Exclude sensitive/large fields

        res.json(doctors);
    } catch (error) {
        console.error('Error searching doctors:', error);
        res.status(500).json({ message: 'Error searching doctors' });
    }
});

// Upload/Create Prescription (Patient uploading an image or request)
router.post('/prescriptions', async (req, res) => {
    try {
        // In a real app, handle file upload (e.g., multer) here and get imageUrl
        const { imageUrl, notes, doctorId } = req.body;
        // Assuming req.user is set by auth middleware
        const patientId = req.body.userId; // Temporary: should come from auth middleware

        const prescription = new Prescription({
            patient: patientId,
            doctor: doctorId,
            imageUrl,
            notes,
            status: 'pending'
        });

        await prescription.save();
        res.status(201).json(prescription);
    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({ message: 'Error creating prescription' });
    }
});

// Get Patient's Prescriptions
router.get('/prescriptions/:userId', async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.params.userId })
            .populate('doctor', 'name specialization')
            .sort({ createdAt: -1 });
        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Error fetching prescriptions' });
    }
});

// Get Patient's Medical History
router.get('/medical-history/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('medicalHistory');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.medicalHistory);
    } catch (error) {
        console.error('Error fetching medical history:', error);
        res.status(500).json({ message: 'Error fetching medical history' });
    }
});

module.exports = router;
