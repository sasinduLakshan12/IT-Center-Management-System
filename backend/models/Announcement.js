const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    audience: {
        type: String,
        enum: ['All students', 'Selected departments', 'Selected academic years', 'Individual student'],
        default: 'All students'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        default: null
    },
    academicYear: {
        type: String,
        enum: ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'],
        default: 'All'
    },
    individualStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null
    },
    priority: {
        type: String,
        enum: ['Normal', 'Important', 'Urgent'],
        default: 'Normal'
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    attachment: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Draft', 'Expired'],
        default: 'Active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
