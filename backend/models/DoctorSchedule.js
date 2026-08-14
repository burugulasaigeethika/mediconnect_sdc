const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    slots: [{
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        isBooked: {
            type: Boolean,
            default: false
        },
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('DoctorSchedule', doctorScheduleSchema);
