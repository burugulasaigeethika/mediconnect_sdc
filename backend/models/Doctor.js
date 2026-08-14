const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        trim: true
    },
    symptomsHandled: [{
        type: String,
        trim: true
    }],
    experienceYears: {
        type: Number,
        default: 0
    },
    consultationFee: {
        type: Number,
        required: [true, 'Consultation fee is required']
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    nextAvailableDate: {
        type: Date
    },
    location: {
        type: String,
        trim: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required']
    },
    weeklySchedule: [{
        day: { type: String, required: true }, // Monday, Tuesday, etc.
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '17:00' },
        isAvailable: { type: Boolean, default: true }
    }],
    status: {
        type: String,
        enum: ['active', 'pending', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
doctorSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
doctorSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('Doctor', doctorSchema);
