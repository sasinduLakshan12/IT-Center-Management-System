const mongoose = require('mongoose');

const studentViolationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    type: {
        type: String,
        enum: ['No Show', 'Late Cancellation', 'Vandalism / Damage', 'Account Sharing', 'Other Policy Abuse'],
        required: true
    },
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    description: {
        type: String,
        required: true
    },
    penaltyApplied: {
        type: String,
        enum: ['Warning', 'Temporary Suspension', 'Deactivation'],
        required: true
    },
    penaltyStart: {
        type: Date,
        default: Date.now
    },
    penaltyEnd: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Waived'],
        default: 'Active'
    },
    waivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    waivedReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('StudentViolation', studentViolationSchema);
