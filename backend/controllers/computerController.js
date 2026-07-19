const Computer = require('../models/Computer');
const Booking = require('../models/Booking');
const { logAction } = require('../utils/auditLogger');
const QRCode = require('qrcode');
const fs = require('fs');

// Get all computers
const getComputers = async (req, res) => {
    try {
        const { search, condition, status, location } = req.query;
        let query = {};

        if (condition) query.condition = condition;
        if (status) query.status = status;
        if (location) query.location = location;

        if (search) {
            query.$or = [
                { pcId: { $regex: search, $options: 'i' } },
                { pcName: { $regex: search, $options: 'i' } },
                { assetNumber: { $regex: search, $options: 'i' } },
                { serialNumber: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } }
            ];
        }

        const computers = await Computer.find(query).sort({ pcId: 1 });
        res.json({ success: true, data: computers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new computer
const addComputer = async (req, res) => {
    try {
        const fields = [
            'pcId', 'pcName', 'assetNumber', 'serialNumber', 'location',
            'roomNumber', 'ipAddress', 'macAddress', 'brand', 'model',
            'processor', 'ram', 'storage', 'operatingSystem', 'installedSoftware',
            'purchaseDate', 'warrantyExpiryDate', 'condition', 'status', 'notes'
        ];

        // Check required fields
        for (const field of ['pcId', 'pcName', 'location']) {
            if (!req.body[field]) {
                return res.status(400).json({ message: `Field '${field}' is required.` });
            }
        }

        // Check if exists
        const exists = await Computer.findOne({ pcId: req.body.pcId.toUpperCase() });

        if (exists) {
            return res.status(400).json({ message: 'A computer with this PC ID already exists.' });
        }

        // Generate QR code base64
        const qrContent = JSON.stringify({
            pcId: req.body.pcId.toUpperCase(),
            serialNumber: req.body.serialNumber,
            assetNumber: req.body.assetNumber
        });
        const qrCodeBase64 = await QRCode.toDataURL(qrContent);

        const computerData = { ...req.body, pcId: req.body.pcId.toUpperCase(), qrCode: qrCodeBase64 };
        const computer = await Computer.create(computerData);

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Create Computer',
            module: 'Asset',
            recordId: computer._id.toString(),
            description: `Admin added computer ${computer.pcId} (${computer.brand} ${computer.model}).`
        });

        res.status(201).json({ success: true, message: 'Computer added successfully', data: computer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update computer
const updateComputer = async (req, res) => {
    try {
        const computer = await Computer.findById(req.params.id);
        if (!computer) {
            return res.status(404).json({ message: 'Computer not found.' });
        }

        const oldValues = computer.toObject();

        const fields = [
            'pcName', 'location', 'roomNumber', 'ipAddress', 'brand', 'model',
            'processor', 'ram', 'storage', 'operatingSystem', 'installedSoftware',
            'condition', 'status', 'lastMaintenanceDate', 'notes'
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                computer[field] = req.body[field];
            }
        });

        const updated = await computer.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Update Computer',
            module: 'Asset',
            recordId: computer._id.toString(),
            description: `Admin updated details of computer ${computer.pcId}.`,
            previousValues: oldValues,
            newValues: updated.toObject()
        });

        res.json({ success: true, message: 'Computer updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete computer
const deleteComputer = async (req, res) => {
    try {
        const computer = await Computer.findById(req.params.id);
        if (!computer) {
            return res.status(404).json({ message: 'Computer not found.' });
        }

        // Check if there are active bookings or future confirmed bookings
        const activeBookings = await Booking.findOne({
            assignedComputer: req.params.id,
            status: { $in: ['Confirmed', 'Active', 'Pending'] }
        });

        if (activeBookings) {
            return res.status(400).json({ message: 'Cannot delete computer with active or future bookings. Reassign bookings first.' });
        }

        await Computer.findByIdAndDelete(req.params.id);

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Delete Computer',
            module: 'Asset',
            recordId: req.params.id,
            description: `Admin deleted computer ${computer.pcId}.`
        });

        res.json({ success: true, message: 'Computer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export to CSV
const exportComputers = async (req, res) => {
    try {
        const computers = await Computer.find({}).sort({ pcId: 1 });

        let csv = 'PC ID,Name,Asset Number,Serial Number,Location,Room,IP Address,MAC Address,Brand,Model,OS,Status,Condition\n';
        computers.forEach(c => {
            csv += `"${c.pcId}","${c.pcName}","${c.assetNumber}","${c.serialNumber}","${c.location}","${c.roomNumber}","${c.ipAddress}","${c.macAddress}","${c.brand}","${c.model}","${c.operatingSystem}","${c.status}","${c.condition}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=computers.csv');
        res.status(200).send(csv);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Import from CSV
const importComputers = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file.' });
        }

        const filePath = req.file.path;
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        // Clean file after reading
        fs.unlinkSync(filePath);

        const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) {
            return res.status(400).json({ message: 'CSV file is empty or only contains header.' });
        }

        // Headers row: PC ID,Name,Asset Number,Serial Number,Location,Room,IP Address,MAC Address,Brand,Model,OS,Status,Condition
        let count = 0;
        let errors = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            // Split by comma accounting for quotes
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
            const values = matches.map(v => v.replace(/^"|"$/g, '').trim());

            if (values.length < 13) {
                errors.push(`Line ${i + 1}: Insufficient columns`);
                continue;
            }

            const [pcId, pcName, assetNumber, serialNumber, location, roomNumber, ipAddress, macAddress, brand, model, operatingSystem, status, condition] = values;

            // Check if already exists
            const exists = await Computer.findOne({
                $or: [
                    { pcId: pcId.toUpperCase() },
                    { assetNumber },
                    { serialNumber },
                    { macAddress }
                ]
            });

            if (exists) {
                errors.push(`Line ${i + 1}: Computer ${pcId} (or Serial/Asset/MAC) already registered.`);
                continue;
            }

            // Generate base64 QR code
            const qrContent = JSON.stringify({ pcId: pcId.toUpperCase(), serialNumber, assetNumber });
            const qrCodeBase64 = await QRCode.toDataURL(qrContent);

            await Computer.create({
                pcId: pcId.toUpperCase(),
                pcName,
                assetNumber,
                serialNumber,
                location,
                roomNumber,
                ipAddress,
                macAddress,
                brand,
                model,
                processor: 'Intel Core i5', // Default values for missing specs in basic import
                ram: '16GB',
                storage: '512GB SSD',
                operatingSystem,
                purchaseDate: new Date(),
                warrantyExpiryDate: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000), // Default 3 years
                status: status || 'Available',
                condition: condition || 'Excellent',
                qrCode: qrCodeBase64
            });

            count++;
        }

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Import Computers CSV',
            module: 'Asset',
            description: `Admin imported ${count} computers via CSV.`
        });

        res.json({
            success: true,
            message: `Successfully imported ${count} computers.`,
            errors: errors.length > 0 ? errors : null
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getComputers,
    addComputer,
    updateComputer,
    deleteComputer,
    exportComputers,
    importComputers
};
