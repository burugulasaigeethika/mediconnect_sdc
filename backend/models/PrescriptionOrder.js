const mongoose = require('mongoose');

const prescriptionOrderSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    prescription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prescription'
    },
    // Store prescription image URL
    prescriptionImageUrl: {
        type: String,
        trim: true
    },
    // Medicines requested in the prescription
    medicines: [{
        medicine: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine'
        },
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        dosage: String,
        frequency: String,
        duration: String,
        notes: String,
        price: {
            type: Number,
            required: true
        },
        // Status for individual medicine item
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    }],
    // Overall order status
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Processing', 'Ready for Dispatch', 'Completed'],
        default: 'Pending'
    },
    // Pharmacist who reviewed the order
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Reason for rejection
    rejectionReason: {
        type: String,
        trim: true
    },
    // Pharmacist notes
    pharmacistNotes: {
        type: String,
        trim: true
    },
    // Delivery address
    deliveryAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    // Payment status
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PrescriptionOrder', prescriptionOrderSchema);