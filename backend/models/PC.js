const mongoose = require('mongoose');

const pcSchema = new mongoose.Schema({
    pcId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'booked', 'out-of-order'],
        default: 'available'
    },
    location: {
        type: String,
        required: true
    },
    issueReported: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('PC', pcSchema);
