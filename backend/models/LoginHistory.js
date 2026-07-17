const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    userModel: {
        type: String,
        enum: ['Student', 'Admin', 'Unknown'],
        default: 'Unknown'
    },
    email: {
        type: String,
        required: true
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
        required: true
    },
    failureReason: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
