const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema({
    bookingDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    position: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Waiting', 'Notified', 'Confirmed', 'Cancelled', 'Expired'],
        default: 'Waiting'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    confirmationDeadline: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Prevent duplicate entries for the same student on the same date and slot in waiting list
waitingListSchema.index({ student: 1, bookingDate: 1, timeSlot: 1, status: 'Waiting' }, { unique: true });

module.exports = mongoose.model('WaitingList', waitingListSchema);
