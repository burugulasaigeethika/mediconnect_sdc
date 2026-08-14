const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Medicine name is required'],
        trim: true
    },
    genericName: {
        type: String,
        trim: true
    },
    manufacturer: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['antibiotic', 'painkiller', 'vitamin', 'supplement', 'prescription', 'otc', 'baby_needs', 'personal_care', 'health_nutrition', 'Basic Needs', 'Medicines & Treatments', 'other'],
        default: 'other'
    },
    description: {
        type: String,
        trim: true
    },
    mrp: {
        type: Number,
        min: 0
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    requiresPrescription: {
        type: Boolean,
        default: false
    },
    dosageForm: {
        type: String,
        enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
        default: 'tablet'
    },
    strength: {
        type: String,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true
    },
    expiryDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Medicine', medicineSchema);
