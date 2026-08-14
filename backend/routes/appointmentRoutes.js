const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { authMiddleware, authorize } = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');
const { doctorPrescriptionUploader } = require('../utils/fileUpload');

// POST /api/appointments - Book new appointment
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { doctorId, appointmentDate, timeSlot, reason, consultationType } = req.body;

        console.log('\n📅 NEW APPOINTMENT BOOKING REQUEST:');
        console.log('   Doctor ID:', doctorId);
        console.log('   Patient ID:', req.user.userId);
        console.log('   Date:', appointmentDate);
        console.log('   Time:', timeSlot);
        console.log('   Consultation Type:', consultationType);

        if (!doctorId || !appointmentDate || !timeSlot) {
            console.error('   ❌ Missing required fields');
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const patientId = req.user.userId;

        // Create appointment with Pending status for doctor to review
        const appointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            reason,
            consultationType: consultationType || 'in-person', // Default to in-person if not provided
            status: 'Pending' // Doctor must accept first
        });

        await appointment.save();
        console.log('   ✅ Appointment created:', appointment._id);

        // CRITICAL: Create or update Doctor-Patient Relationship
        const DoctorPatient = require('../models/DoctorPatient');
        let relation = await DoctorPatient.findOne({ doctorId, patientId });

        if (!relation) {
            console.log('   📝 Creating NEW DoctorPatient relationship...');
            relation = new DoctorPatient({
                doctorId,
                patientId,
                status: 'new',
                lastVisit: appointmentDate
            });
            await relation.save();
            console.log('   ✅ DoctorPatient relationship created with status: new');
        } else {
            console.log('   📝 Updating EXISTING DoctorPatient relationship...');
            console.log('      Current status:', relation.status);

            // Update last visit
            relation.lastVisit = appointmentDate;
            if (relation.status === 'rejected') {
                relation.status = 'new'; // Reset status if previously rejected
                console.log('      Status changed from rejected -> new');
            }
            await relation.save();
            console.log('   ✅ DoctorPatient relationship updated');
            console.log('      Final status:', relation.status);
        }

        console.log('   ✅ Booking completed successfully\n');
        res.status(201).json({ message: 'Appointment booked successfully', appointment });
    } catch (error) {
        console.error('❌ Error booking appointment:', error.message);
        res.status(500).json({ message: 'Error booking appointment', error: error.message });
    }
});

// GET /api/appointments/my - Get patient's appointments
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.user.userId })
            .populate('doctorId', 'name specialization consultationFee location')
            .sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// GET /api/appointments/doctor/:doctorId - Get doctor's appointments  (for availability check)
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctorId: req.params.doctorId })
            .select('appointmentDate timeSlot status')
            .sort({ appointmentDate: 1 });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching doctor appointments', error: error.message });
    }
});

// GET /api/appointments/my-appointments - Get doctor's appointments (authenticated, with patient details)
router.get('/my-appointments', authMiddleware, authorize('doctor'), async (req, res) => {
    try {
        // Show Pending, Booked, and Completed appointments (exclude Rejected and Cancelled)
        const appointments = await Appointment.find({
            doctorId: req.user.userId,
            status: { $in: ['Pending', 'Booked', 'Completed'] }
        })
            .populate('patientId', 'name email phone')
            .sort({ appointmentDate: -1 });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});

// PATCH /api/appointments/:id/cancel - Cancel appointment
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
    try {
        const appointment = await Appointment.findOne({
            _id: req.params.id,
            patientId: req.user.userId
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status === 'Cancelled') {
            return res.status(400).json({ message: 'Appointment is already cancelled' });
        }

        appointment.status = 'Cancelled';
        await appointment.save();

        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling appointment', error: error.message });
    }
});

// POST /api/appointments/:appointmentId/send-prescription - Doctor sends prescription (online consultations)
router.post(
    '/:appointmentId/send-prescription',
    authMiddleware,
    authorize('doctor'),
    doctorPrescriptionUploader,
    appointmentController.sendPrescription
);

module.exports = router;
