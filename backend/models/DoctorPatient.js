const mongoose = require('mongoose');

const doctorPatientSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        index: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['new', 'pending', 'accepted', 'rejected'],
        default: 'new',
        index: true
    },
    lastVisit: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to ensure unique doctor-patient pairs
doctorPatientSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

// Additional indexes for common queries
doctorPatientSchema.index({ doctorId: 1, status: 1 }); // Filter by status
doctorPatientSchema.index({ doctorId: 1, createdAt: -1 }); // Sort by creation date

// Instance methods for status transitions
doctorPatientSchema.methods.accept = function () {
    this.status = 'accepted';
    return this.save();
};

doctorPatientSchema.methods.reject = function () {
    this.status = 'rejected';
    return this.save();
};

doctorPatientSchema.methods.canAccept = function () {
    return this.status === 'new' || this.status === 'pending';
};

module.exports = mongoose.model('DoctorPatient', doctorPatientSchema);
