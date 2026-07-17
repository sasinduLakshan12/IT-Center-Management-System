const mongoose = require('mongoose');

const closedPeriodSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    reason: {
        type: String,
        enum: ['Maintenance', 'Holiday', 'Examination', 'Special Event', 'Network Failure', 'Emergency'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Cancelled'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ClosedPeriod', closedPeriodSchema);
