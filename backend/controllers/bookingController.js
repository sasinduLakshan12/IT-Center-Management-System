const Booking = require('../models/Booking');
const PC = require('../models/PC');
const User = require('../models/User');

// @desc    Book a PC
// @route   POST /api/bookings
// @access  Private
const bookPC = async (req, res) => {
    try {
        const { pcId, durationMinutes } = req.body;
        const studentId = req.user._id;

        // 1. Check if user has exceeded daily limit (Max 3 hours = 180 mins, students only)
        const user = await User.findById(studentId);
        if (user.role === 'student' && user.dailyUsageMinutes + durationMinutes > 180) {
            return res.status(400).json({ message: 'Daily quota of 3 hours exceeded' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'You are blocked from booking' });
        }

        // 2. Check if PC is available
        const pc = await PC.findById(pcId);
        if (!pc || pc.status !== 'available') {
            return res.status(400).json({ message: 'PC is not available' });
        }

        // 3. Create booking
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        const booking = await Booking.create({
            studentId,
            pcId,
            startTime,
            endTime,
            status: 'booked'
        });

        // 4. Update PC status
        pc.status = 'booked';
        await pc.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-in to a booked PC
// @route   PUT /api/bookings/:id/checkin
// @access  Private
const checkIn = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking || booking.status !== 'booked') {
            return res.status(400).json({ message: 'Invalid booking' });
        }

        if (booking.studentId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = 'active';
        booking.checkInTime = new Date();
        await booking.save();

        // Update PC status to occupied
        const pc = await PC.findById(booking.pcId);
        pc.status = 'occupied';
        await pc.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-out of a PC
// @route   PUT /api/bookings/:id/checkout
// @access  Private
const checkOut = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking || booking.status !== 'active') {
            return res.status(400).json({ message: 'No active session found' });
        }

        // Calculate time used
        const endTime = new Date();
        const timeUsedMs = endTime - booking.checkInTime;
        const minutesUsed = Math.ceil(timeUsedMs / 60000);

        // Update User's daily usage
        const user = await User.findById(booking.studentId);
        user.dailyUsageMinutes += minutesUsed;
        await user.save();

        booking.status = 'completed';
        booking.endTime = endTime;
        await booking.save();

        // Free up the PC
        const pc = await PC.findById(booking.pcId);
        pc.status = 'available';
        await pc.save();

        res.json({ message: 'Checked out successfully', minutesUsed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's active or booked session
// @route   GET /api/bookings/my-active
// @access  Private
const getMyActiveBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({
            studentId: req.user._id,
            status: { $in: ['booked', 'active'] }
        }).populate('pcId');

        res.json(booking || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { bookPC, checkIn, checkOut, getMyActiveBooking };
