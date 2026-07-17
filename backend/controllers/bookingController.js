const Booking = require('../models/Booking');
const Computer = require('../models/Computer');
const TimeSlot = require('../models/TimeSlot');
const Student = require('../models/Student');
const SystemSetting = require('../models/SystemSetting');
const ClosedPeriod = require('../models/ClosedPeriod');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');
const { logAction } = require('../utils/auditLogger');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Helper to generate reference number
const generateReference = () => {
    return 'BKG' + crypto.randomBytes(4).toString('hex').toUpperCase();
};

// @desc    Book a computer
// @route   POST /api/bookings
// @access  Private/Student
const createBooking = async (req, res) => {
    try {
        const { bookingDate, timeSlotId, purpose } = req.body;
        const studentId = req.user._id;

        if (!bookingDate || !timeSlotId || !purpose) {
            return res.status(400).json({ message: 'Booking date, time slot, and purpose are required.' });
        }

        const dateObj = new Date(bookingDate);
        dateObj.setHours(0, 0, 0, 0);

        // 1. Check if IT Center is closed
        const closedPeriod = await ClosedPeriod.findOne({
            startDate: { $lte: dateObj },
            endDate: { $gte: dateObj },
            status: 'Active'
        });

        if (closedPeriod) {
            return res.status(400).json({ message: `IT Center is closed on this date. Reason: ${closedPeriod.reason}` });
        }

        // 2. Validate Time Slot
        const slot = await TimeSlot.findById(timeSlotId);
        if (!slot || !slot.isActive || !slot.isAvailableForBooking) {
            return res.status(400).json({ message: 'Selected time slot is invalid or currently unavailable.' });
        }

        // 3. Check student limits
        const student = await Student.findById(studentId);
        const settings = await SystemSetting.findOne({}) || {};
        
        const dailyLimit = settings.dailyBookingLimit || 2;
        
        // Count student's bookings for this day
        const todayBookings = await Booking.countDocuments({
            student: studentId,
            bookingDate: dateObj,
            status: { $in: ['Confirmed', 'Active', 'Pending'] }
        });

        if (todayBookings >= dailyLimit) {
            return res.status(400).json({ message: `You have reached the maximum daily booking limit of ${dailyLimit}.` });
        }

        // Check if student already booked this exact slot
        const duplicateBooking = await Booking.findOne({
            student: studentId,
            bookingDate: dateObj,
            timeSlot: timeSlotId,
            status: { $in: ['Confirmed', 'Active', 'Pending'] }
        });

        if (duplicateBooking) {
            return res.status(400).json({ message: 'You already have a booking for this time slot on this date.' });
        }

        // 4. Automatic Computer Allocation
        // Find all computers that are currently Available or Good condition
        const allAvailablePcs = await Computer.find({ status: 'Available' });

        if (allAvailablePcs.length === 0) {
            // No computers are physically available at all
            return res.status(400).json({ message: 'No computers are currently available in the IT Center.' });
        }

        // Find bookings that overlap with this date and slot
        const conflictingBookings = await Booking.find({
            bookingDate: dateObj,
            timeSlot: timeSlotId,
            status: { $in: ['Confirmed', 'Active', 'Pending'] }
        }).select('assignedComputer');

        const conflictingPcIds = conflictingBookings.map(b => b.assignedComputer.toString());

        // Find a PC that is NOT in conflictingPcIds
        const freePc = allAvailablePcs.find(pc => !conflictingPcIds.includes(pc._id.toString()));

        if (!freePc) {
            // In the future this should go to the Waiting List
            return res.status(400).json({ message: 'All computers are fully booked for this time slot. Waiting list feature coming soon.' });
        }

        // 5. Create Booking
        const refNumber = generateReference();
        
        // Generate QR Code for the booking check-in
        const qrContent = JSON.stringify({ referenceNumber: refNumber, studentId: student.studentId });
        const qrCodeBase64 = await QRCode.toDataURL(qrContent);

        const booking = await Booking.create({
            referenceNumber: refNumber,
            student: studentId,
            bookingDate: dateObj,
            timeSlot: timeSlotId,
            assignedComputer: freePc._id,
            purpose,
            status: 'Confirmed', // Auto confirm based on settings usually
            qrCode: qrCodeBase64
        });

        // 6. Notifications
        await sendBookingConfirmation(student, {
            referenceNumber: refNumber,
            bookingDate: dateObj,
            slotDetails: `${slot.slotName} (${slot.startTime} - ${slot.endTime})`,
            computerName: `${freePc.pcId} (${freePc.location})`
        });

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: 'Student',
            action: 'Create Booking',
            module: 'Booking',
            recordId: booking._id.toString(),
            description: `Student ${student.studentId} booked ${freePc.pcId} for slot ${slot.slotName}.`
        });

        res.status(201).json({ success: true, message: 'Booking confirmed successfully', data: booking });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Student or Admin)
const cancelBooking = async (req, res) => {
    try {
        const { reason } = req.body;
        const booking = await Booking.findById(req.params.id).populate('student').populate('timeSlot');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Authorization: Only the owner or an admin can cancel
        if (req.user.role !== 'admin' && booking.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
        }

        if (['Cancelled', 'Completed', 'Missed', 'Rejected'].includes(booking.status)) {
            return res.status(400).json({ message: `Cannot cancel a booking that is already ${booking.status}.` });
        }

        booking.status = 'Cancelled';
        booking.cancellationReason = reason || 'Cancelled by user';
        await booking.save();

        if (booking.student) {
            await sendBookingCancellation(booking.student, {
                referenceNumber: booking.referenceNumber,
                bookingDate: booking.bookingDate
            }, booking.cancellationReason);
        }

        await logAction({
            userId: req.user._id,
            operatorName: req.user.name,
            role: req.user.role === 'admin' ? 'Admin' : 'Student',
            action: 'Cancel Booking',
            module: 'Booking',
            recordId: booking._id.toString(),
            description: `Booking ${booking.referenceNumber} cancelled. Reason: ${booking.cancellationReason}`
        });

        res.json({ success: true, message: 'Booking cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current student's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private/Student
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ student: req.user._id })
            .populate('timeSlot', 'slotName startTime endTime')
            .populate('assignedComputer', 'pcId location')
            .sort({ bookingDate: -1, createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
    try {
        const { status, date } = req.query;
        let query = {};

        if (status) query.status = status;
        if (date) {
            const dateObj = new Date(date);
            dateObj.setHours(0,0,0,0);
            query.bookingDate = dateObj;
        }

        const bookings = await Booking.find(query)
            .populate('student', 'name studentId department')
            .populate('timeSlot', 'slotName startTime endTime')
            .populate('assignedComputer', 'pcId location')
            .sort({ bookingDate: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    cancelBooking,
    getMyBookings,
    getAllBookings
};
