const User = require('../models/User');
const PC = require('../models/PC');
const Booking = require('../models/Booking');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalPCs = await PC.countDocuments({});
        const availablePCs = await PC.countDocuments({ status: 'available' });
        const occupiedPCs = await PC.countDocuments({ status: 'occupied' });
        const bookedPCs = await PC.countDocuments({ status: 'booked' });
        const outOfOrderPCs = await PC.countDocuments({ status: 'out-of-order' });

        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalLecturers = await User.countDocuments({ role: 'lecturer' });
        const pendingApprovals = await User.countDocuments({ isApproved: false, role: { $ne: 'admin' } });

        const activeSessions = await Booking.countDocuments({ status: 'active' });

        res.json({
            pcs: {
                total: totalPCs,
                available: availablePCs,
                occupied: occupiedPCs,
                booked: bookedPCs,
                outOfOrder: outOfOrderPCs
            },
            users: {
                students: totalStudents,
                lecturers: totalLecturers,
                pendingApprovals
            },
            sessions: {
                active: activeSessions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending user registrations
// @route   GET /api/admin/pending-approvals
// @access  Private/Admin
const getPendingApprovals = async (req, res) => {
    try {
        const pending = await User.find({ isApproved: false, role: { $ne: 'admin' } }).select('-password');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a pending user
// @route   PUT /api/admin/approve-user/:id
// @access  Private/Admin
const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isApproved = true;
        await user.save();

        res.json({ message: `Approved user: ${user.name} (${user.studentId})` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject/Delete a pending user
// @route   DELETE /api/admin/reject-user/:id
// @access  Private/Admin
const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User registration rejected and account deleted.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (excluding admins)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle block status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.json({ message: `User ${user.name} has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active or pending bookings
// @route   GET /api/admin/sessions
// @access  Private/Admin
const getActiveSessions = async (req, res) => {
    try {
        const sessions = await Booking.find({ status: { $in: ['booked', 'active'] } })
            .populate('studentId', 'name studentId email role')
            .populate('pcId', 'pcId location');
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Force cancel/terminate a booking session
// @route   DELETE /api/admin/sessions/:id
// @access  Private/Admin
const cancelSession = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Set status to cancelled
        booking.status = 'cancelled';
        booking.endTime = new Date();
        await booking.save();

        // Release PC status
        const pc = await PC.findById(booking.pcId);
        if (pc) {
            pc.status = 'available';
            await pc.save();
        }

        res.json({ message: 'Session terminated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a PC
// @route   DELETE /api/admin/pcs/:id
// @access  Private/Admin
const deletePC = async (req, res) => {
    try {
        const pc = await PC.findById(req.params.id);
        if (!pc) {
            return res.status(404).json({ message: 'PC not found' });
        }

        await PC.findByIdAndDelete(req.params.id);
        res.json({ message: 'PC deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reported issue tickets (out-of-order PCs)
// @route   GET /api/admin/issues
// @access  Private/Admin
const getIssues = async (req, res) => {
    try {
        const issues = await PC.find({ status: 'out-of-order' });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resolve a reported issue ticket
// @route   PUT /api/admin/issues/:id/resolve
// @access  Private/Admin
const resolveIssue = async (req, res) => {
    try {
        const pc = await PC.findById(req.params.id);
        if (!pc) {
            return res.status(404).json({ message: 'PC not found' });
        }

        pc.status = 'available';
        pc.issueReported = null;
        await pc.save();

        res.json({ message: 'Issue marked as resolved. PC is now available.', pc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getPendingApprovals,
    approveUser,
    rejectUser,
    getUsers,
    toggleBlockUser,
    getActiveSessions,
    cancelSession,
    deletePC,
    getIssues,
    resolveIssue
};
