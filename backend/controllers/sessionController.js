const Booking = require('../models/Booking');
const Computer = require('../models/Computer');
const ComputerSession = require('../models/ComputerSession');
const CheckInRecord = require('../models/CheckInRecord');
const { logAction } = require('../utils/auditLogger');

// @desc    Check-in to a computer (Start session)
// @route   POST /api/sessions/check-in
// @access  Private (Admin or Student)
const checkIn = async (req, res) => {
    try {
        const { bookingId, referenceNumber, checkInMethod } = req.body;

        // Find booking by ID or Reference Number
        let query = {};
        if (bookingId) query._id = bookingId;
        else if (referenceNumber) query.referenceNumber = referenceNumber.toUpperCase();
        else return res.status(400).json({ message: 'Booking ID or Reference Number is required.' });

        const booking = await Booking.findOne(query).populate('student').populate('assignedComputer').populate('timeSlot');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (booking.status === 'Active') {
            return res.status(400).json({ message: 'Session is already active.' });
        }

        if (booking.status !== 'Confirmed') {
            return res.status(400).json({ message: `Cannot check-in. Booking status is ${booking.status}.` });
        }

        // Validate time constraints
        const now = new Date();
        const bookingDate = new Date(booking.bookingDate);
        
        // Ensure today is the booking date
        if (now.toDateString() !== bookingDate.toDateString()) {
            return res.status(400).json({ message: 'You can only check-in on the exact date of your booking.' });
        }

        const [startHour, startMinute] = booking.timeSlot.startTime.split(':').map(Number);
        const slotStart = new Date(bookingDate);
        slotStart.setHours(startHour, startMinute, 0, 0);

        // Allow check-in 10 minutes early
        const earlyLimit = new Date(slotStart.getTime() - 10 * 60000);
        if (now < earlyLimit) {
            return res.status(400).json({ message: `You are too early. Check-in opens at ${earlyLimit.toLocaleTimeString()}.` });
        }

        // Create CheckIn Record
        await CheckInRecord.create({
            booking: booking._id,
            student: booking.student._id,
            computer: booking.assignedComputer._id,
            method: checkInMethod || 'QR Code Scan',
            verificationMethod: req.user.role === 'admin' ? 'Admin Verification' : 'Student Account Link',
            isSuccess: true
        });

        // Start Computer Session
        const [endHour, endMinute] = booking.timeSlot.endTime.split(':').map(Number);
        const slotEnd = new Date(bookingDate);
        slotEnd.setHours(endHour, endMinute, 0, 0);

        const session = await ComputerSession.create({
            student: booking.student._id,
            computer: booking.assignedComputer._id,
            booking: booking._id,
            startTime: now,
            endTime: slotEnd
        });

        // Update Booking & Computer Status
        booking.status = 'Active';
        await booking.save();

        const pc = await Computer.findById(booking.assignedComputer._id);
        pc.status = 'InUse';
        await pc.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: req.user.role === 'admin' ? 'Admin' : 'Student',
            action: 'Session Check-In',
            module: 'Session',
            recordId: session._id.toString(),
            description: `Check-in successful for ${booking.referenceNumber} on PC ${pc.pcId}.`
        });

        res.status(200).json({ success: true, message: 'Check-in successful. Session started.', data: session });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check-out of a computer (End session)
// @route   POST /api/sessions/check-out
// @access  Private (Admin or Student)
const checkOut = async (req, res) => {
    try {
        const { sessionId, bookingId } = req.body;

        let query = { status: 'Active' };
        if (sessionId) query._id = sessionId;
        else if (bookingId) query.booking = bookingId;
        else return res.status(400).json({ message: 'Session ID or Booking ID is required.' });

        const session = await ComputerSession.findOne(query).populate('booking');

        if (!session) {
            return res.status(404).json({ message: 'Active session not found.' });
        }

        const booking = await Booking.findById(session.booking._id);
        const pc = await Computer.findById(session.computer);

        session.status = 'Completed';
        // Wait, ComputerSession model requires endTime, which we already set upon creation, so we just update status
        await session.save();

        booking.status = 'Completed';
        await booking.save();

        pc.status = 'Available';
        await pc.save();

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: req.user.role === 'admin' ? 'Admin' : 'Student',
            action: 'Session Check-Out',
            module: 'Session',
            recordId: session._id.toString(),
            description: `Check-out successful for ${booking.referenceNumber} on PC ${pc.pcId}.`
        });

        res.status(200).json({ success: true, message: 'Check-out successful. Session ended.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    checkIn,
    checkOut
};
