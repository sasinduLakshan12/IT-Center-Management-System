const mongoose = require('mongoose');

const checkInRecordSchema = new mongoose.Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    },
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
    checkInTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    method: {
        type: String,
        enum: ['QR Code Scan', 'Manual Booking Reference', 'Student ID Card Scan', 'Admin Manual Assisted'],
        required: true
    },
    verificationMethod: {
        type: String,
        enum: ['Student Account Link', 'Email OTP Code', 'ID Card Comparison', 'Admin Verification'],
        default: 'Student Account Link'
    },
    ipAddress: {
        type: String,
        default: ''
    },
    deviceInfo: {
        type: String,
        default: ''
    },
    isSuccess: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('CheckInRecord', checkInRecordSchema);
