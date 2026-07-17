const mongoose = require('mongoose');

const computerSessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    computer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Computer',
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'ForcedOut'],
        default: 'Active'
    },
    sessionExtensionMinutes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('ComputerSession', computerSessionSchema);
