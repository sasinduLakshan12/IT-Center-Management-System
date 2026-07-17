const WaitingList = require('../models/WaitingList');
const Booking = require('../models/Booking');

// @desc    Get current student's waiting list positions
// @route   GET /api/waiting-list/my-status
// @access  Private/Student
const getMyWaitingList = async (req, res) => {
    try {
        const waitingList = await WaitingList.find({ student: req.user._id })
            .populate('timeSlot', 'slotName startTime endTime')
            .sort({ createdAt: -1 });

        // Calculate their dynamic position in the queue
        const data = await Promise.all(waitingList.map(async (entry) => {
            if (entry.status !== 'Waiting') return entry.toObject();

            const positionInQueue = await WaitingList.countDocuments({
                bookingDate: entry.bookingDate,
                timeSlot: entry.timeSlot._id,
                status: 'Waiting',
                createdAt: { $lte: entry.createdAt }
            });

            return { ...entry.toObject(), currentPosition: positionInQueue };
        }));

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all waiting list entries
// @route   GET /api/waiting-list
// @access  Private/Admin
const getAllWaitingList = async (req, res) => {
    try {
        const { date, status } = req.query;
        let query = {};

        if (status) query.status = status;
        if (date) {
            const dateObj = new Date(date);
            dateObj.setHours(0,0,0,0);
            query.bookingDate = dateObj;
        }

        const list = await WaitingList.find(query)
            .populate('student', 'name studentId email')
            .populate('timeSlot', 'slotName startTime endTime')
            .sort({ bookingDate: -1, position: 1 });

        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyWaitingList,
    getAllWaitingList
};
