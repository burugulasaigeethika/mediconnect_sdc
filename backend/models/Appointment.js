const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Index for faster patient lookups
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true // Index for faster doctor lookups
    },
    appointmentDate: {
        type: Date,
        required: true,
        index: true // Index for date-based queries
    },
    timeSlot: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Booked', 'Completed', 'Cancelled', 'Rejected'],
        default: 'Pending',
        index: true // Index for status filtering
    },
    reason: {
        type: String,
        trim: true
    },
    symptoms: {
        type: String,
        trim: true
    },
    consultationType: {
        type: String,
        enum: ['in-person', 'video', 'phone'],
        default: 'in-person'
    },
    // Doctor prescription upload fields (for online consultations)
    prescriptionFileUrl: {
        type: String,
        trim: true
    },
    prescriptionFileKey: {
        type: String,
        trim: true
    },
    hasPrescription: {
        type: Boolean,
        default: false
    },
    prescriptionSentAt: {
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Compound indexes for common query patterns
appointmentSchema.index({ patientId: 1, appointmentDate: -1 }); // Patient's appointments by date
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 }); // Doctor's appointments by date
appointmentSchema.index({ doctorId: 1, status: 1 }); // Doctor's appointments by status

module.exports = mongoose.model('Appointment', appointmentSchema);
