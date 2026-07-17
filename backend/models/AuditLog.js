const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null // null if done by system cron or anonymous
    },
    userModel: {
        type: String,
        enum: ['Student', 'Admin', 'System'],
        default: 'System'
    },
    operatorName: {
        type: String,
        required: true,
        default: 'System'
    },
    role: {
        type: String,
        required: true,
        default: 'System'
    },
    action: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    recordId: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        required: true
    },
    previousValues: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    newValues: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    ipAddress: {
        type: String,
        default: ''
    },
    deviceInfo: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
