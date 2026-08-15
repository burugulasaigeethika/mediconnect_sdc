const Appointment = require('../models/Appointment');
const User = require('../models/User');
const cloudStorageService = require('../services/cloudStorageService');
const { sendDoctorPrescriptionEmail } = require('../services/emailService');

/**
 * Doctor sends prescription after online consultation
 * POST /appointments/:appointmentId/send-prescription
 */
exports.sendPrescription = async (req, res) => {
    try {
        console.log('=== SEND PRESCRIPTION CONTROLLER CALLED ===');
        console.log('Request user:', req.user);
        console.log('Appointment ID:', req.params.appointmentId);
        console.log('File:', req.file);

        const doctorId = req.user.userId;
        const appointmentId = req.params.appointmentId;

        // Validate file upload
        if (!req.file) {
            console.log('No file uploaded');
            return res.status(400).json({ message: 'No prescription file uploaded. Please select a file.' });
        }

        // Find the appointment
        const appointment = await Appointment.findById(appointmentId)
            .populate('patientId', 'name email')
            .populate('doctorId', 'name');

        if (!appointment) {
            console.log('Appointment not found');
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify the doctor owns this appointment
        if (appointment.doctorId._id.toString() !== doctorId) {
            console.log('Doctor not authorized for this appointment');
            return res.status(403).json({ message: 'You are not authorized to upload prescription for this appointment' });
        }

        // Check if appointment is in a valid status (not cancelled)
        if (appointment.status === 'Cancelled') {
            return res.status(400).json({ message: 'Cannot send prescription for a cancelled appointment' });
        }

        console.log('Uploading file to cloud storage');
        // Upload file using cloud storage service
        const fileData = await cloudStorageService.uploadFile(req.file, 'doctor-prescriptions');
        console.log('File uploaded successfully:', fileData);

        // Update appointment with prescription details
        appointment.prescriptionFileUrl = fileData.url;
        appointment.prescriptionFileKey = fileData.key || fileData.filename;
        appointment.hasPrescription = true;
        appointment.prescriptionSentAt = new Date();

        // Optionally mark as completed
        if (appointment.status === 'Booked') {
            appointment.status = 'Completed';
        }

        await appointment.save();
        console.log('Appointment updated with prescription details');

        // Send email to patient
        const patientEmail = appointment.patientId.email;
        const patientName = appointment.patientId.name;
        const doctorName = appointment.doctorId.name;

        // Construct full URL for prescription download
        // If using local storage, the URL will be relative, so we need to make it absolute
        let prescriptionUrl = fileData.url;
        if (!prescriptionUrl.startsWith('http')) {
            // Relative URL - construct absolute URL dynamically from request host
            const host = req.get('host');
            const protocol = req.protocol;
            prescriptionUrl = `${protocol}://${host}${fileData.url}`;
        }

        console.log('Sending email to patient:', patientEmail);
        const emailResult = await sendDoctorPrescriptionEmail(
            patientEmail,
            patientName,
            doctorName,
            prescriptionUrl
        );

        if (!emailResult.success) {
            console.warn('Email sending failed:', emailResult.error);
            // Don't fail the request - prescription is uploaded, just email failed
            return res.status(200).json({
                success: true,
                message: 'Prescription uploaded successfully, but email notification failed. Please inform the patient manually.',
                appointment,
                emailError: emailResult.error
            });
        }

        console.log('Email sent successfully');
        res.status(200).json({
            success: true,
            message: 'Prescription uploaded and email sent to patient successfully',
            appointment
        });

    } catch (error) {
        console.error('Error in sendPrescription:', error);
        res.status(500).json({
            message: 'Error uploading prescription',
            error: error.message
        });
    }
};
