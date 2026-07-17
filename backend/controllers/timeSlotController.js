const TimeSlot = require('../models/TimeSlot');
const Booking = require('../models/Booking');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all time slots
// @route   GET /api/time-slots
// @access  Private
const getTimeSlots = async (req, res) => {
    try {
        const { isActive, day } = req.query;
        let query = {};

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        if (day) {
            query.workingDays = day;
        }

        const slots = await TimeSlot.find(query).sort({ startTime: 1 });
        res.json({ success: true, data: slots });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a time slot
// @route   POST /api/time-slots
// @access  Private/Admin
const createTimeSlot = async (req, res) => {
    try {
        const { slotName, startTime, endTime, duration, capacity, workingDays, notes } = req.body;

        if (!slotName || !startTime || !endTime || !duration) {
            return res.status(400).json({ message: 'Slot name, start time, end time, and duration are required.' });
        }

        // Overlap checking is complex because of string "HH:MM", we will just do basic existence check for now
        const exists = await TimeSlot.findOne({ slotName, startTime, endTime });
        if (exists) {
            return res.status(400).json({ message: 'A time slot with this exact name and times already exists.' });
        }

        const slot = await TimeSlot.create({
            slotName,
            startTime,
            endTime,
            duration,
            capacity: capacity || 20,
            workingDays: workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            notes
        });

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Create Time Slot',
            module: 'Settings',
            recordId: slot._id.toString(),
            description: `Admin created time slot: ${slotName} (${startTime}-${endTime})`
        });

        res.status(201).json({ success: true, message: 'Time slot created successfully', data: slot });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a time slot
// @route   PUT /api/time-slots/:id
// @access  Private/Admin
const updateTimeSlot = async (req, res) => {
    try {
        const slot = await TimeSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Time slot not found' });
        }

        const oldValues = slot.toObject();
        const fields = ['slotName', 'startTime', 'endTime', 'duration', 'capacity', 'workingDays', 'isActive', 'isAvailableForBooking', 'notes'];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                slot[field] = req.body[field];
            }
        });

        const updated = await slot.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Update Time Slot',
            module: 'Settings',
            recordId: slot._id.toString(),
            description: `Admin updated time slot: ${slot.slotName}`,
            previousValues: oldValues,
            newValues: updated.toObject()
        });

        res.json({ success: true, message: 'Time slot updated successfully', data: updated });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a time slot
// @route   DELETE /api/time-slots/:id
// @access  Private/Admin
const deleteTimeSlot = async (req, res) => {
    try {
        const slot = await TimeSlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Time slot not found' });
        }

        // Check active/future bookings
        const activeBookings = await Booking.findOne({
            timeSlot: req.params.id,
            bookingDate: { $gte: new Date().setHours(0,0,0,0) },
            status: { $in: ['Confirmed', 'Active', 'Pending'] }
        });

        if (activeBookings) {
            return res.status(400).json({ message: 'Cannot delete time slot because there are active or future bookings using it.' });
        }

        await TimeSlot.findByIdAndDelete(req.params.id);

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Delete Time Slot',
            module: 'Settings',
            recordId: req.params.id,
            description: `Admin deleted time slot: ${slot.slotName}`
        });

        res.json({ success: true, message: 'Time slot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot
};
