const mongoose = require('mongoose');

const maintenanceTicketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
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
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    category: {
        type: String,
        enum: [
            'Computer does not start',
            'Monitor issue',
            'Keyboard issue',
            'Mouse issue',
            'Internet problem',
            'Software issue',
            'Login problem',
            'Slow performance',
            'Audio issue',
            'Power issue',
            'Other'
        ],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Normal', 'Important', 'Urgent'],
        default: 'Normal'
    },
    attachment: {
        type: String, // File path / URL
        default: ''
    },
    status: {
        type: String,
        enum: ['Open', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
        default: 'Open'
    },
    adminComments: {
        type: String,
        default: ''
    },
    resolutionDetails: {
        type: String,
        default: ''
    },
    resolvedDate: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceTicket', maintenanceTicketSchema);
