const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    studentId: { // Admin ID format, e.g., ADMIN001
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'admin'
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
