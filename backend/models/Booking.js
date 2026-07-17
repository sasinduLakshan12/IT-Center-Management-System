const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    referenceNumber: {
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
    bookingDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: true
    },
    assignedComputer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Computer',
        required: true
    },
    purpose: {
        type: String,
        enum: [
            'Assignment work',
            'Programming practice',
            'Research',
            'Project work',
            'Online examination',
            'Internet access',
            'Learning activities',
            'Document preparation',
            'Other'
        ],
        required: true
    },
    status: {
        type: String,
        enum: [
            'Pending',
            'Confirmed',
            'Waiting List',
            'Cancelled',
            'Active',
            'Completed',
            'Missed',
            'Expired',
            'Rejected'
        ],
        default: 'Confirmed' // default auto-confirmed if computer is free
    },
    checkInTime: {
        type: Date,
        default: null
    },
    checkOutTime: {
        type: Date,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    waitingListPosition: {
        type: Number,
        default: null
    },
    qrCode: {
        type: String, // Base64 or URL
        default: ''
    }
}, { timestamps: true });

// Compound index to prevent double booking of the same computer at the same date & time slot
bookingSchema.index({ bookingDate: 1, timeSlot: 1, assignedComputer: 1, status: { $in: ['Confirmed', 'Active', 'Pending'] } }, { unique: true });

// Prevent a student from having multiple bookings for the same date and slot
bookingSchema.index({ student: 1, bookingDate: 1, timeSlot: 1, status: { $in: ['Confirmed', 'Active', 'Pending'] } }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
