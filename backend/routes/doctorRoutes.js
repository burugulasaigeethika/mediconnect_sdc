const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const DoctorSchedule = require('../models/DoctorSchedule');
const { authMiddleware } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { config } = require('../config/env');
const RecentSearchService = require('../services/recentSearchService');
const doctorController = require('../controllers/doctorController');

// Schedule Management Routes (Protected)
router.get('/schedule', authMiddleware, doctorController.getSchedule);
router.put('/schedule', authMiddleware, doctorController.updateSchedule);

// Dashboard Routes
router.get('/dashboard/stats', authMiddleware, doctorController.getDashboardStats);

// Profile Update Route
router.put('/:id', authMiddleware, doctorController.updateProfile);

// GET /api/doctors - Return all doctors with availability
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
                { symptomsHandled: { $regex: search, $options: 'i' } }
            ];
        }

        const doctors = await Doctor.find(query).select('-passwordHash');

        // Track recent search if search term exists and user is authenticated
        if (search && req.user && req.user.userId) {
            try {
                await RecentSearchService.addRecentSearch(
                    req.user.userId,
                    'doctor',
                    `search:${search}`,
                    `Search: ${search}`
                );
            } catch (trackError) {
                console.error('Error tracking doctor search:', trackError);
            }
        }

        // Attach availability data for each doctor
        const doctorsWithAvailability = await Promise.all(
            doctors.map(async (doctor) => {
                const schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
                const now = new Date();

                if (schedule && schedule.slots.length > 0) {
                    const availableSlots = schedule.slots
                        .filter(slot => !slot.isBooked && new Date(slot.date) >= now)
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    return {
                        ...doctor.toObject(),
                        hasSchedule: true,
                        availableSlots: availableSlots.slice(0, 5), // Limit to 5 upcoming slots
                        totalAvailableSlots: availableSlots.length,
                        nextAvailable: availableSlots[0] || null
                    };
                }

                return {
                    ...doctor.toObject(),
                    hasSchedule: false,
                    availableSlots: [],
                    totalAvailableSlots: 0,
                    nextAvailable: null
                };
            })
        );

        res.json(doctorsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error: error.message });
    }
});

// GET /api/doctors/available - Return available doctors
router.get('/available', async (req, res) => {
    try {
        const doctors = await Doctor.find({ isAvailable: true }).select('-passwordHash');
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available doctors', error: error.message });
    }
});

// GET /api/doctors/specialization/:specialization
router.get('/specialization/:specialization', async (req, res) => {
    try {
        const { specialization } = req.params;
        const doctors = await Doctor.find({
            specialization: { $regex: specialization, $options: 'i' }
        }).select('-passwordHash');

        // Attach availability data
        const doctorsWithAvailability = await Promise.all(
            doctors.map(async (doctor) => {
                const schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
                const now = new Date();

                if (schedule && schedule.slots.length > 0) {
                    const availableSlots = schedule.slots
                        .filter(slot => !slot.isBooked && new Date(slot.date) >= now)
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    return {
                        ...doctor.toObject(),
                        hasSchedule: true,
                        availableSlots: availableSlots.slice(0, 5),
                        totalAvailableSlots: availableSlots.length,
                        nextAvailable: availableSlots[0] || null
                    };
                }

                return {
                    ...doctor.toObject(),
                    hasSchedule: false,
                    availableSlots: [],
                    totalAvailableSlots: 0,
                    nextAvailable: null
                };
            })
        );

        res.json(doctorsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors by specialization', error: error.message });
    }
});

// GET /api/doctors/symptom/:symptom
router.get('/symptom/:symptom', async (req, res) => {
    try {
        const { symptom } = req.params;
        const doctors = await Doctor.find({
            symptomsHandled: { $regex: symptom, $options: 'i' }
        }).select('-passwordHash');

        // Attach availability data
        const doctorsWithAvailability = await Promise.all(
            doctors.map(async (doctor) => {
                const schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
                const now = new Date();

                if (schedule && schedule.slots.length > 0) {
                    const availableSlots = schedule.slots
                        .filter(slot => !slot.isBooked && new Date(slot.date) >= now)
                        .sort((a, b) => new Date(a.date) - new Date(b.date));

                    return {
                        ...doctor.toObject(),
                        hasSchedule: true,
                        availableSlots: availableSlots.slice(0, 5),
                        totalAvailableSlots: availableSlots.length,
                        nextAvailable: availableSlots[0] || null
                    };
                }

                return {
                    ...doctor.toObject(),
                    hasSchedule: false,
                    availableSlots: [],
                    totalAvailableSlots: 0,
                    nextAvailable: null
                };
            })
        );

        res.json(doctorsWithAvailability);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctors by symptom', error: error.message });
    }
});

// GET /api/doctors/:id/availability - Get doctor's available slots
router.get('/:id/availability', async (req, res) => {
    try {
        const schedule = await DoctorSchedule.findOne({ doctorId: req.params.id });

        if (!schedule) {
            return res.json({
                hasSchedule: false,
                availableSlots: [],
                message: 'Doctor has not set up their schedule yet'
            });
        }

        const now = new Date();
        const availableSlots = schedule.slots
            .filter(slot => !slot.isBooked && new Date(slot.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json({
            hasSchedule: true,
            availableSlots,
            totalSlots: availableSlots.length,
            nextAvailable: availableSlots[0] || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching availability', error: error.message });
    }
});

// GET /api/doctors/:id - Return single doctor with availability
router.get('/:id', async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).select('-passwordHash');
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Track as recent search if user is authenticated
        if (req.user && req.user.userId) {
            await RecentSearchService.addRecentSearch(
                req.user.userId,
                'doctor',
                doctor._id.toString(),
                `Dr. ${doctor.name}`
            );
        }

        // Add availability data
        const schedule = await DoctorSchedule.findOne({ doctorId: doctor._id });
        const now = new Date();

        if (schedule && schedule.slots.length > 0) {
            const availableSlots = schedule.slots
                .filter(slot => !slot.isBooked && new Date(slot.date) >= now)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            return res.json({
                ...doctor.toObject(),
                hasSchedule: true,
                availableSlots,
                totalAvailableSlots: availableSlots.length,
                nextAvailable: availableSlots[0] || null
            });
        }

        res.json({
            ...doctor.toObject(),
            hasSchedule: false,
            availableSlots: [],
            totalAvailableSlots: 0,
            nextAvailable: null
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor', error: error.message });
    }
});

// POST /api/doctors - Create new doctor
router.post('/', async (req, res) => {
    try {
        const { name, email, specialization, consultationFee, password } = req.body;

        // Basic validation
        if (!name || !email || !specialization || !consultationFee || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: 'Doctor already exists' });
        }

        const doctor = new Doctor({
            ...req.body,
            passwordHash: password, // Will be hashed by pre-save hook
            status: 'active' // Automatically set status to active for new registrations
        });

        await doctor.save();

        const doctorResponse = doctor.toObject();
        delete doctorResponse.passwordHash;

        res.status(201).json({ message: 'Doctor created successfully', doctor: doctorResponse });
    } catch (error) {
        res.status(500).json({ message: 'Error creating doctor', error: error.message });
    }
});

// POST /api/doctors/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const doctor = await Doctor.findOne({ email });
        if (!doctor) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await doctor.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: doctor._id, role: 'doctor' },
            config.jwtSecret,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                role: 'doctor'
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login error', error: error.message });
    }
});

module.exports = router;
