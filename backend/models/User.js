const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'pharmacist', 'admin'],
        default: 'patient'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive'],
        default: 'active'
    },
    phone: {
        type: String,
        trim: true
    },
    emergencyContact: {
        name: String,
        phone: String
    },
    // Doctor-specific fields
    specialization: {
        type: String,
        trim: true
    },
    qualifications: {
        type: String,
        trim: true
    },
    experience: {
        type: Number
    },
    consultationFee: {
        type: Number
    },
    availableSlots: [{
        day: String,
        startTime: String,
        endTime: String
    }],
    symptoms: [{
        type: String,
        trim: true
    }],
    // Pharmacist-specific fields
    employeeId: {
        type: String,
        trim: true
    },
    pharmacyName: {
        type: String,
        trim: true
    },
    licenseNumber: {
        type: String,
        trim: true
    },
    yearsOfExperience: {
        type: Number
    },
    // Patient-specific fields
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String
    },
    medicalHistory: [{
        condition: String,
        diagnosedDate: Date,
        notes: String
    }],
    insuranceProvider: {
        type: String,
        trim: true
    },
    allergies: [{
        type: String,
        trim: true
    }],
    currentMedications: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
