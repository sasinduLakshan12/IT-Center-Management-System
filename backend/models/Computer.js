const mongoose = require('mongoose');

const computerSchema = new mongoose.Schema({
    pcId: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    pcName: {
        type: String,
        required: true,
        trim: true
    },
    assetNumber: {
        type: String,
        trim: true
    },
    serialNumber: {
        type: String,
        trim: true
    },
    location: {
        type: String, // Row/Area, e.g. Row A
        required: true,
        trim: true
    },
    roomNumber: {
        type: String,
        default: 'Main Lab',
        trim: true
    },
    ipAddress: {
        type: String,
        trim: true
    },
    macAddress: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true
    },
    model: {
        type: String,
        trim: true
    },
    processor: {
        type: String,
        trim: true
    },
    ram: {
        type: String, // e.g. 16GB
        trim: true
    },
    storage: {
        type: String, // e.g. 512GB SSD
        trim: true
    },
    operatingSystem: {
        type: String,
        trim: true
    },
    installedSoftware: {
        type: [String],
        default: []
    },
    purchaseDate: {
        type: Date
    },
    warrantyExpiryDate: {
        type: Date
    },
    condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Excellent'
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'InUse', 'Maintenance', 'Decommissioned', 'Damaged', 'Out of Service', 'Inactive'],
        default: 'Available'
    },
    lastMaintenanceDate: {
        type: Date,
        default: null
    },
    qrCode: {
        type: String, // Base64 or URL
        default: ''
    },
    notes: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('Computer', computerSchema);
