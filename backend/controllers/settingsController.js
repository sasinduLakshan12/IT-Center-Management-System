const SystemSetting = require('../models/SystemSetting');
const ClosedPeriod = require('../models/ClosedPeriod');
const { logAction } = require('../utils/auditLogger');

// Get system settings (singleton)
const getSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne({});
        if (!settings) {
            // Create default
            settings = await SystemSetting.create({});
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update system settings
const updateSettings = async (req, res) => {
    try {
        let settings = await SystemSetting.findOne({});
        if (!settings) {
            settings = new SystemSetting();
        }

        const oldValues = settings.toObject();

        const fields = [
            'universityName', 'itCenterName', 'logoUrl', 'contactPhone', 'contactEmail',
            'openingTime', 'closingTime', 'workingDays', 'maxSessionDuration', 'gracePeriod',
            'dailyBookingLimit', 'weeklyBookingLimit', 'maxAdvanceBookingDays',
            'waitingListConfirmationTime', 'cancellationDeadline', 'noShowWarningLimit',
            'temporaryPenaltyDuration', 'automaticApproval', 'systemTimezone'
        ];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                settings[field] = req.body[field];
            }
        });

        const updated = await settings.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Update System Settings',
            module: 'Settings',
            recordId: settings._id.toString(),
            description: 'Admin modified system-wide IT center configuration rules.',
            previousValues: oldValues,
            newValues: updated.toObject()
        });

        res.json({ success: true, message: 'Settings updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Closed periods management
const getClosedPeriods = async (req, res) => {
    try {
        const closures = await ClosedPeriod.find({ status: 'Active' }).sort({ startDate: 1 });
        res.json({ success: true, data: closures });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createClosedPeriod = async (req, res) => {
    try {
        const { title, reason, startDate, endDate, description } = req.body;

        if (!title || !reason || !startDate || !endDate) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const closure = await ClosedPeriod.create({
            title,
            reason,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            description,
            createdBy: req.user._id
        });

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Add Closed Period',
            module: 'Settings',
            recordId: closure._id.toString(),
            description: `Admin scheduled IT center closure: "${title}" from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
        });

        res.status(201).json({ success: true, message: 'Closed period created successfully', data: closure });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteClosedPeriod = async (req, res) => {
    try {
        const cp = await ClosedPeriod.findById(req.params.id);
        if (!cp) {
            return res.status(404).json({ message: 'Closed period not found.' });
        }

        cp.status = 'Cancelled';
        await cp.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Cancel Closed Period',
            module: 'Settings',
            recordId: cp._id.toString(),
            description: `Admin cancelled closure period: "${cp.title}"`
        });

        res.json({ success: true, message: 'Closed period cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getClosedPeriods,
    createClosedPeriod,
    deleteClosedPeriod
};
