const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    prescriptionId: {
        type: String,
        unique: true,
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Store prescription image URL
    prescriptionImageUrl: {
        type: String,
        trim: true
    },
    // Store prescription file key for deletion
    prescriptionFileKey: {
        type: String,
        trim: true
    },
    // Medicines prescribed
    medicines: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine'
        },
        name: {
            type: String,
            required: true
        },
        dosage: String,
        frequency: String,
        duration: String,
        notes: String,
        price: {
            type: Number,
            required: true
        }
    }],
    diagnosis: {
        type: String
    },
    notes: {
        type: String
    },
    // Prescription validity period
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date
    },
    // Status tracking
    status: {
        type: String,
        enum: ['Pending Review', 'Approved', 'Rejected', 'Expired', 'Archived'],
        default: 'Pending Review'
    },
    // Review information
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    // Digital signature for authenticity (in a real system, this would be more complex)
    digitalSignature: {
        type: String
    },
    // Encryption metadata (for future implementation)
    isEncrypted: {
        type: Boolean,
        default: false
    },
    encryptionMetadata: {
        algorithm: String,
        keyId: String
    }
}, {
    timestamps: true
});

// Index for better query performance
prescriptionSchema.index({ patient: 1, status: 1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);