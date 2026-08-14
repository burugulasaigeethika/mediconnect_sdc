const mongoose = require('mongoose');

const recentSearchSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['medicine', 'doctor', 'order'],
        required: true
    },
    itemId: {
        type: String, // Can be medicine ID, doctor ID, or order ID
        required: true
    },
    itemName: {
        type: String, // Display name for the item
        required: true
    },
    searchTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
recentSearchSchema.index({ userId: 1, type: 1, searchTime: -1 });
recentSearchSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('RecentSearch', recentSearchSchema);