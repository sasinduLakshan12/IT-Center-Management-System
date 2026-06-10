const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pcId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PC',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['booked', 'active', 'completed', 'cancelled'],
        default: 'booked'
    },
    checkInTime: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
