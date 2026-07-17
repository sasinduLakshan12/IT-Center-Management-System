const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
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
    personalEmail: {
        type: String,
        lowercase: true,
        trim: true,
        default: ''
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    degreeProgramme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DegreeProgramme',
        required: true
    },
    academicYear: {
        type: String,
        required: true,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    semester: {
        type: String,
        required: true,
        enum: ['Semester 1', 'Semester 2']
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String, // file path / url
        default: ''
    },
    idCardImage: {
        type: String, // file path / url
        default: ''
    },
    status: {
        type: String,
        enum: [
            'Email Verification Pending',
            'Pending Approval',
            'Approved',
            'Rejected',
            'Suspended',
            'Deactivated'
        ],
        default: 'Email Verification Pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    dailyUsageMinutes: {
        type: Number,
        default: 0
    },
    weeklyUsageMinutes: {
        type: Number,
        default: 0
    },
    penaltyStatus: {
        type: String,
        enum: ['None', 'Warned', 'Suspended'],
        default: 'None'
    },
    penaltyEnd: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        default: 'student'
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
