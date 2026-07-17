const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        default: null // null indicates anonymous feedback
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    category: {
        type: String,
        enum: ['Booking Process', 'Computer Quality', 'Internet Speed', 'Cleanliness', 'Staff Support', 'Other'],
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    relatedBooking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        default: null
    },
    attachment: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Rejected'],
        default: 'Submitted'
    },
    adminResponse: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
