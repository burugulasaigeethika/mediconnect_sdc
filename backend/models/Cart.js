const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicines: [{
        medicineId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Medicine',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
