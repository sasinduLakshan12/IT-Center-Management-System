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
        required: true,
        unique: true,
        trim: true
    },
    serialNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {
        type: String, // Row/Area, e.g. Row A
        required: true,
        trim: true
    },
    roomNumber: {
        type: String,
        required: true,
        trim: true
    },
    ipAddress: {
        type: String,
        required: true,
        trim: true
    },
    macAddress: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    },
    model: {
        type: String,
        required: true,
        trim: true
    },
    processor: {
        type: String,
        required: true,
        trim: true
    },
    ram: {
        type: String, // e.g. 16GB
        required: true,
        trim: true
    },
    storage: {
        type: String, // e.g. 512GB SSD
        required: true,
        trim: true
    },
    operatingSystem: {
        type: String,
        required: true,
        trim: true
    },
    installedSoftware: {
        type: [String],
        default: []
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    warrantyExpiryDate: {
        type: Date,
        required: true
    },
    condition: {
        type: String,
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        default: 'Excellent'
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'In Use', 'Under Maintenance', 'Damaged', 'Out of Service', 'Inactive'],
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
