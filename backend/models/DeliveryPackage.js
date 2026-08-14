const mongoose = require('mongoose');

const deliveryPackageSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    patient: {
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
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
    status: {
        type: String,
        enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'],
        default: 'pending'
    },
    assignedTo: {
        type: String, // Delivery person identifier
        trim: true
    },
    trackingId: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeliveryPackage', deliveryPackageSchema);