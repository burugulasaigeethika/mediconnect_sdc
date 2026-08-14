const express = require('express');
const router = express.Router();
const DoctorSchedule = require('../models/DoctorSchedule');
const DoctorPatient = require('../models/DoctorPatient');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { validateAppointmentBooking } = require('../middleware/validation');
const { AppError, catchAsync } = require('../middleware/errorHandler');
const { sendDoctorNotificationEmail } = require('../services/emailService');

// POST /api/patient/appointments - Book new appointment
router.post('/appointments',
    authMiddleware,
    validateAppointmentBooking,
    catchAsync(async (req, res, next) => {
        const { doctorId, slotId, date, startTime, endTime, symptoms, consultationType } = req.body;
        const patientId = req.user.userId;

        let appointmentDate, timeSlot;

        // Validate doctor exists
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            return next(new AppError('Doctor not found', 404));
        }

        // Check if this is a slot-based booking or direct booking
        if (slotId) {
            // SLOT-BASED BOOKING (from schedule page)
            const schedule = await DoctorSchedule.findOne({ doctorId });
            if (!schedule) {
                return next(new AppError('Doctor schedule not found', 404));
            }

            const slot = schedule.slots.id(slotId);
            if (!slot) {
                return next(new AppError('Slot not found', 404));
            }

            if (slot.isBooked) {
                return next(new AppError('Slot is already booked', 400));
            }

            // Mark slot as booked
            slot.isBooked = true;
            slot.patientId = patientId;
            await schedule.save();

            appointmentDate = slot.date;
            timeSlot = `${slot.startTime} - ${slot.endTime}`;
        } else if (date && startTime && endTime) {
            // DIRECT BOOKING (from doctor profile page)
            appointmentDate = new Date(date);
            timeSlot = `${startTime} - ${endTime}`;

            // Validate appointment date is in the future
            if (appointmentDate < new Date()) {
                return next(new AppError('Appointment date must be in the future', 400));
            }
        } else {
            return next(new AppError('Either slotId or date/time must be provided', 400));
        }

        // Check for duplicate appointments
        const existingAppointment = await Appointment.findOne({
            patientId,
            doctorId,
            appointmentDate: {
                $gte: new Date(appointmentDate).setHours(0, 0, 0, 0),
                $lt: new Date(appointmentDate).setHours(23, 59, 59, 999)
            },
            status: { $nin: ['Cancelled', 'Rejected'] }
        });

        if (existingAppointment) {
            return next(new AppError('You already have an appointment with this doctor on this date', 400));
        }

        // Get patient details
        const patient = await User.findById(patientId);
        if (!patient) {
            return next(new AppError('Patient not found', 404));
        }

        // Create Appointment record
        const appointment = new Appointment({
            patientId,
            doctorId,
            appointmentDate,
            timeSlot,
            status: 'Pending',
            reason: symptoms || '',
            symptoms: symptoms || '',
            consultationType: consultationType || 'in-person'
        });
        await appointment.save();

        console.log('✅ Appointment created:', appointment._id);

        // Update or Create Doctor-Patient Relationship
        try {
            let relation = await DoctorPatient.findOne({ doctorId, patientId });

            if (!relation) {
                // Create new relationship
                relation = new DoctorPatient({
                    doctorId,
                    patientId,
                    status: 'new',
                    lastVisit: appointmentDate
                });
                await relation.save();
                console.log('✅ New DoctorPatient relationship created:', relation._id);
            } else {
                // Update existing relationship
                relation.lastVisit = appointmentDate;
                if (relation.status === 'rejected') {
                    relation.status = 'new'; // Reset status if previously rejected
                }
                await relation.save();
                console.log('✅ DoctorPatient relationship updated:', relation._id);
            }
        } catch (error) {
            // If DoctorPatient creation fails, still continue (but log error)
            console.error('⚠️  Error updating DoctorPatient relationship:', error);
            // Don't throw - appointment is still valid even if relationship creation fails
        }

        // Create in-app notification for doctor
        try {
            const notification = new Notification({
                userId: doctorId,
                userModel: 'Doctor',
                type: 'new_appointment',
                message: `New appointment request from ${patient.name || patient.firstName + ' ' + patient.lastName}`,
                relatedId: appointment._id,
                relatedModel: 'Appointment'
            });
            await notification.save();
            console.log('✅ Notification created for doctor');

            // Emit socket event if io is available
            const io = req.app.get('io');
            if (io) {
                io.to(doctorId.toString()).emit('new_notification', {
                    message: notification.message,
                    type: notification.type,
                    createdAt: notification.createdAt
                });
            }
        } catch (error) {
            console.error('⚠️  Error creating notification:', error);
        }

        // Send email notification to doctor (non-blocking)
        if (doctor.email) {
            sendDoctorNotificationEmail(
                doctor.email,
                doctor.name,
                patient.name || `${patient.firstName} ${patient.lastName}`,
                {
                    date: new Date(appointmentDate).toLocaleDateString(),
                    time: timeSlot
                }
            ).catch(err => console.error('⚠️  Email send failed:', err));
        }

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully! The doctor will review your request.',
            appointment: {
                _id: appointment._id,
                doctorName: doctor.name,
                appointmentDate,
                timeSlot,
                status: appointment.status,
                consultationType: appointment.consultationType
            }
        });
    })
);

module.exports = router;
