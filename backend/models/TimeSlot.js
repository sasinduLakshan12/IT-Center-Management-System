const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
    slotName: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: String, // format "HH:MM", e.g. "08:00"
        required: true
    },
    endTime: {
        type: String, // format "HH:MM", e.g. "09:00"
        required: true
    },
    duration: {
        type: Number, // duration in minutes, e.g. 60
        required: true
    },
    capacity: {
        type: Number, // Max students/computers allowed in this slot
        required: true,
        default: 20
    },
    workingDays: {
        type: [String], // e.g. ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isAvailableForBooking: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);
