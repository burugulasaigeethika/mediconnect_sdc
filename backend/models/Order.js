const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prescriptionFile: {
        type: String,
        trim: true
    },
    prescriptionFileKey: {
        type: String,
        trim: true
    },
    orderItems: [{
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
        price: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending Review', 'Approved - Awaiting Payment', 'Paid', 'Processing', 'Ready for Dispatch', 'Completed', 'Rejected'],
        default: 'Pending Review'
    },
    deliveryAddress: {
        street: {
            type: String,
            required: false
        },
        city: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        zipCode: {
            type: String,
            required: false
        }
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    // Doctor details for prescription
    doctorName: {
        type: String,
        trim: true
    },
    doctorRegistrationNumber: {
        type: String,
        trim: true
    },
    consultationType: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    clinicOrHospitalName: {
        type: String,
        trim: true
    },
    consultationDate: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    },
    // Razorpay payment fields
    razorpayOrderId: {
        type: String,
        trim: true
    },
    razorpayPaymentId: {
        type: String,
        trim: true
    },
    razorpaySignature: {
        type: String,
        trim: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online'],
        default: 'cash'
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);