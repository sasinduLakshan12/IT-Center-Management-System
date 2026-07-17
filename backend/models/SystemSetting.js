const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
    universityName: {
        type: String,
        default: 'University of Vocational Technology'
    },
    itCenterName: {
        type: String,
        default: 'Main IT Center'
    },
    logoUrl: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        default: '+94 11 263 0700'
    },
    contactEmail: {
        type: String,
        default: 'itcenter@univ.ac.lk'
    },
    openingTime: {
        type: String,
        default: '08:00'
    },
    closingTime: {
        type: String,
        default: '20:00'
    },
    workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    maxSessionDuration: {
        type: Number, // in minutes, e.g. 60
        default: 60
    },
    gracePeriod: {
        type: Number, // in minutes, e.g. 10 minutes to check-in
        default: 10
    },
    dailyBookingLimit: {
        type: Number, // e.g. 2 bookings per day
        default: 2
    },
    weeklyBookingLimit: {
        type: Number, // e.g. 6 bookings per week
        default: 6
    },
    maxAdvanceBookingDays: {
        type: Number, // e.g. 7 days in advance
        default: 7
    },
    waitingListConfirmationTime: {
        type: Number, // in minutes to confirm promoted waiting list slot, e.g. 15
        default: 15
    },
    cancellationDeadline: {
        type: Number, // in minutes before start, e.g. 30
        default: 30
    },
    noShowWarningLimit: {
        type: Number, // count of no-shows allowed before suspension
        default: 3
    },
    temporaryPenaltyDuration: {
        type: Number, // in hours to suspend booking access, e.g. 24
        default: 24
    },
    automaticApproval: {
        type: Boolean, // if true, booking is confirmed immediately without approval checks
        default: true
    },
    systemTimezone: {
        type: String,
        default: 'Asia/Colombo'
    }
}, { timestamps: true });

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
