const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
    computer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Computer',
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaintenanceTicket',
        default: null
    },
    status: {
        type: String,
        enum: ['Reported', 'Scheduled', 'In Progress', 'Waiting for Parts', 'Completed', 'Unrepairable'],
        default: 'Scheduled'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        default: null
    },
    repairDetails: {
        type: String,
        default: ''
    },
    replacedComponents: {
        type: [String],
        default: []
    },
    repairCost: {
        type: Number,
        default: 0
    },
    documents: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
