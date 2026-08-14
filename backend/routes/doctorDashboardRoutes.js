const express = require('express');
const router = express.Router();
const DoctorPatient = require('../models/DoctorPatient');
const DoctorSchedule = require('../models/DoctorSchedule');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { authMiddleware } = require('../middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentRejection } = require('../services/emailService');

// Middleware to ensure user is a doctor
const ensureDoctor = (req, res, next) => {
    if (req.user.role !== 'doctor') {
        return res.status(403).json({ message: 'Access denied. Doctors only.' });
    }
    next();
};

// Apply auth and role check to all routes
router.use(authMiddleware, ensureDoctor);

// GET /api/doctor/patients
router.get('/patients', async (req, res) => {
    try {
        const { status, search } = req.query;
        const doctorId = req.user.userId;

        let query = { doctorId };

        if (status && status !== 'All Patients') {
            // Map frontend filter text to db status if needed
            // "New Patients" -> "new"
            // "Pending Records" -> "pending"
            // "All Patients" -> ignore
            if (status === 'New Patients') query.status = 'new';
            else if (status === 'Pending Records') query.status = 'pending';
            else if (status !== 'all') query.status = status.toLowerCase();
        }

        // If search is provided, we need to find users matching the search first
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            const matchingUsers = await User.find({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex },
                    { firstName: searchRegex },
                    { lastName: searchRegex }
                ]
            }).select('_id');

            const matchingUserIds = matchingUsers.map(u => u._id);
            query.patientId = { $in: matchingUserIds };
        }

        const patients = await DoctorPatient.find(query)
            .populate('patientId', 'name email phone dateOfBirth gender address profileImage')
            .sort({ createdAt: -1 });

        // Transform data for frontend
        const formattedPatients = await Promise.all(patients.map(async (p) => {
            // Find the most recent appointment for this patient
            const appointment = await Appointment.findOne({
                patientId: p.patientId._id,
                doctorId
            }).sort({ createdAt: -1 });

            return {
                _id: p.patientId._id, // Use patient ID for frontend keys/actions
                doctorPatientId: p._id,
                name: p.patientId.name || `${p.patientId.firstName} ${p.patientId.lastName}`,
                email: p.patientId.email,
                phone: p.patientId.phone,
                patientId: p.patientId._id.toString().substring(0, 6).toUpperCase(), // Mock ID
                lastVisit: p.lastVisit || p.createdAt,
                status: p.status,
                avatar: p.patientId.profileImage, // Assuming this field exists or handle in frontend
                appointmentDate: appointment ? appointment.appointmentDate : null,
                appointmentTime: appointment ? appointment.timeSlot : null
            };
        }));

        res.json(formattedPatients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Error fetching patients' });
    }
});

// PATCH /api/doctor/patients/:patientId/accept
router.patch('/patients/:patientId/accept', async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.userId;

        // Find by patientId (User ID) and doctorId
        const relation = await DoctorPatient.findOneAndUpdate(
            { patientId, doctorId },
            { status: 'accepted' },
            { new: true }
        );

        if (!relation) {
            return res.status(404).json({ message: 'Patient relationship not found' });
        }

        // Update appointment status from Pending to Booked
        await Appointment.updateMany(
            { patientId, doctorId, status: 'Pending' },
            { status: 'Booked' }
        );

        // Send email confirmation to patient
        const patient = await User.findById(patientId);
        const doctor = await Doctor.findById(doctorId);

        if (patient && patient.email && doctor) {
            // Find the most recent appointment for this patient-doctor pair
            const appointment = await Appointment.findOne({
                patientId,
                doctorId
            }).sort({ createdAt: -1 });

            if (appointment) {
                sendAppointmentConfirmation(
                    patient.email,
                    patient.name || `${patient.firstName} ${patient.lastName}`,
                    doctor.name,
                    {
                        date: new Date(appointment.appointmentDate).toLocaleDateString(),
                        time: appointment.timeSlot
                    }
                ).catch(err => console.error('Email send failed:', err));
            }
        }

        res.json({ message: 'Patient accepted successfully', status: 'accepted' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting patient' });
    }
});

// PATCH /api/doctor/patients/:patientId/reject
router.patch('/patients/:patientId/reject', async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.userId;

        const relation = await DoctorPatient.findOneAndUpdate(
            { patientId, doctorId },
            { status: 'rejected' },
            { new: true }
        );

        if (!relation) {
            return res.status(404).json({ message: 'Patient relationship not found' });
        }

        // Update appointment status from Pending to Rejected
        await Appointment.updateMany(
            { patientId, doctorId, status: 'Pending' },
            { status: 'Rejected' }
        );

        // Send rejection email to patient
        const patient = await User.findById(patientId);
        const doctor = await Doctor.findById(doctorId);

        if (patient && patient.email && doctor) {
            // Find the most recent appointment for this patient-doctor pair
            const appointment = await Appointment.findOne({
                patientId,
                doctorId
            }).sort({ createdAt: -1 });

            if (appointment) {
                const { reason } = req.body;
                sendAppointmentRejection(
                    patient.email,
                    patient.name || `${patient.firstName} ${patient.lastName}`,
                    doctor.name,
                    {
                        date: new Date(appointment.appointmentDate).toLocaleDateString(),
                        time: appointment.timeSlot
                    },
                    reason
                ).catch(err => console.error('Email send failed:', err));
            }
        }

        res.json({ message: 'Patient rejected successfully', status: 'rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting patient' });
    }
});

// --- Schedule Routes ---

// GET /api/doctor/schedule
router.get('/schedule', async (req, res) => {
    try {
        const doctorId = req.user.userId;
        let schedule = await DoctorSchedule.findOne({ doctorId });

        if (!schedule) {
            return res.json({ slots: [] });
        }

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule' });
    }
});

// POST /api/doctor/schedule (Add slot)
router.post('/schedule', async (req, res) => {
    try {
        const { date, startTime, endTime } = req.body;
        const doctorId = req.user.userId;

        let schedule = await DoctorSchedule.findOne({ doctorId });

        if (!schedule) {
            schedule = new DoctorSchedule({ doctorId, slots: [] });
        }

        // Check for overlap (simple check)
        // In a real app, we'd do time comparison
        const isOverlap = schedule.slots.some(slot =>
            new Date(slot.date).toDateString() === new Date(date).toDateString() &&
            slot.startTime === startTime
        );

        if (isOverlap) {
            return res.status(400).json({ message: 'Slot already exists' });
        }

        schedule.slots.push({
            date,
            startTime,
            endTime,
            isBooked: false
        });

        await schedule.save();
        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error adding slot' });
    }
});

// DELETE /api/doctor/schedule/:slotId
router.delete('/schedule/:slotId', async (req, res) => {
    try {
        const { slotId } = req.params;
        const doctorId = req.user.userId;

        const schedule = await DoctorSchedule.findOne({ doctorId });
        if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

        schedule.slots = schedule.slots.filter(slot => slot._id.toString() !== slotId);
        await schedule.save();

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting slot' });
    }
});

// --- Weekly Schedule Routes ---

// GET /api/doctor/weekly-schedule
router.get('/weekly-schedule', async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const doctor = await Doctor.findById(doctorId);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Return weekly schedule or default
        const defaultSchedule = [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', isAvailable: true },
            { day: 'Saturday', startTime: '09:00', endTime: '17:00', isAvailable: false },
            { day: 'Sunday', startTime: '09:00', endTime: '17:00', isAvailable: false }
        ];

        res.json(doctor.weeklySchedule && doctor.weeklySchedule.length > 0 ? doctor.weeklySchedule : defaultSchedule);
    } catch (error) {
        console.error('Error fetching weekly schedule:', error);
        res.status(500).json({ message: 'Error fetching weekly schedule' });
    }
});

// PUT /api/doctor/weekly-schedule
router.put('/weekly-schedule', async (req, res) => {
    try {
        const doctorId = req.user.userId;
        const { weeklySchedule } = req.body;

        if (!Array.isArray(weeklySchedule)) {
            return res.status(400).json({ message: 'Invalid schedule format' });
        }

        console.log('📅 Updating weekly schedule for doctor:', doctorId);

        // Update weekly schedule in Doctor model
        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { weeklySchedule },
            { new: true }
        );

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        console.log(`✅ Updated weekly schedule for Dr. ${doctor.name}`);

        // Generate dated slots for the next 30 days
        const slots = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + i);
            const dayName = daysOfWeek[currentDate.getDay()];

            // Find matching weekly schedule
            const daySchedule = weeklySchedule?.find(s => s.day === dayName && s.isAvailable);

            if (daySchedule) {
                // Generate hourly slots between start and end time
                const startHour = parseInt(daySchedule.startTime.split(':')[0]);
                const endHour = parseInt(daySchedule.endTime.split(':')[0]);

                for (let hour = startHour; hour < endHour; hour++) {
                    // Format for 12-hour display
                    const displayStartHour = hour % 12 || 12;
                    const displayEndHour = (hour + 1) % 12 || 12;
                    const startPeriod = hour < 12 ? 'AM' : 'PM';
                    const endPeriod = (hour + 1) < 12 || (hour + 1) === 24 ? 'AM' : 'PM';

                    slots.push({
                        date: new Date(currentDate),
                        startTime: `${displayStartHour.toString().padStart(2, '0')}:00 ${startPeriod}`,
                        endTime: `${displayEndHour.toString().padStart(2, '0')}:00 ${endPeriod}`,
                        isBooked: false
                    });
                }
            }
        }

        console.log(`📋 Generated ${slots.length} dated slots`);

        // Update or create DoctorSchedule
        let doctorSchedule = await DoctorSchedule.findOne({ doctorId });

        if (doctorSchedule) {
            // Clear old slots and add new ones
            doctorSchedule.slots = slots;
            await doctorSchedule.save();
            console.log('✅ Updated DoctorSchedule with new slots');
        } else {
            // Create new DoctorSchedule
            doctorSchedule = new DoctorSchedule({
                doctorId,
                slots
            });
            await doctorSchedule.save();
            console.log('✅ Created new DoctorSchedule');
        }

        res.json({
            message: 'Weekly schedule updated successfully',
            weeklySchedule: doctor.weeklySchedule,
            generatedSlots: slots.length
        });
    } catch (error) {
        console.error('Error updating weekly schedule:', error);
        res.status(500).json({ message: 'Error updating weekly schedule' });
    }
});

module.exports = router;
