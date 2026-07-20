const Student = require('../models/Student');
const Admin = require('../models/Admin');
const Computer = require('../models/Computer');
const Booking = require('../models/Booking');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
const { logAction } = require('../utils/auditLogger');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const totalComputers = await Computer.countDocuments({});
        const availableComputers = await Computer.countDocuments({ status: 'Available' });
        const reservedComputers = await Computer.countDocuments({ status: 'Reserved' });
        const inUseComputers = await Computer.countDocuments({ status: 'In Use' });
        const maintenanceComputers = await Computer.countDocuments({ status: { $in: ['Maintenance', 'Decommissioned', 'Damaged', 'Out of Service'] } });

        const totalStudents = await Student.countDocuments({ status: 'Approved' });
        const pendingApprovals = await Student.countDocuments({ status: 'Pending Approval' });
        const suspendedStudents = await Student.countDocuments({ status: 'Suspended' });

        const activeSessions = await Booking.countDocuments({ status: 'Active' });
        const todayBookings = await Booking.countDocuments({ 
            bookingDate: { 
                $gte: new Date().setHours(0, 0, 0, 0),
                $lt: new Date().setHours(23, 59, 59, 999)
            }
        });

        res.json({
            computers: {
                total: totalComputers,
                available: availableComputers,
                reserved: reservedComputers,
                inUse: inUseComputers,
                maintenance: maintenanceComputers
            },
            students: {
                approved: totalStudents,
                pending: pendingApprovals,
                suspended: suspendedStudents
            },
            sessions: {
                active: activeSessions,
                today: todayBookings
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending student registrations
// @route   GET /api/admin/pending-approvals
// @access  Private/Admin
const getPendingApprovals = async (req, res) => {
    try {
        const pending = await Student.find({ status: 'Pending Approval' })
            .select('-password')
            .populate('department', 'departmentName')
            .populate('degreeProgramme', 'programmeName');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve a pending student
// @route   PUT /api/admin/approve-student/:id
// @access  Private/Admin
const approveStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.status !== 'Pending Approval' && student.status !== 'Rejected') {
            return res.status(400).json({ message: 'Student must be pending approval or rejected.' });
        }

        student.status = 'Approved';
        await student.save();

        // Send Email
        await sendApprovalEmail(student);

        // Log Action
        await logAction({
            userId: req.user._id,
            userModel: 'Admin',
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Approve Student',
            module: 'Admin',
            recordId: student._id.toString(),
            description: `Admin approved student ${student.studentId} (${student.name}).`
        });

        res.json({ message: `Approved student: ${student.name} (${student.studentId})` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject a pending student
// @route   PUT /api/admin/reject-student/:id
// @access  Private/Admin
const rejectStudent = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required.' });
        }

        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.status = 'Rejected';
        student.rejectionReason = reason;
        await student.save();

        // Send Email
        await sendRejectionEmail(student, reason);

        // Log Action
        await logAction({
            userId: req.user._id,
            userModel: 'Admin',
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Reject Student',
            module: 'Admin',
            recordId: student._id.toString(),
            description: `Admin rejected student ${student.studentId}. Reason: ${reason}`
        });

        res.json({ message: 'Student registration rejected successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private/Admin
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({}).select('-password')
            .populate('department', 'name')
            .populate('degreeProgramme', 'name');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle block/suspend status of a student
// @route   PUT /api/admin/students/:id/suspend
// @access  Private/Admin
const toggleSuspendStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (student.status === 'Suspended') {
            student.status = 'Approved';
            student.penaltyStatus = 'None';
            student.penaltyEnd = null;
        } else {
            student.status = 'Suspended';
            student.penaltyStatus = 'Suspended';
            // Default 7 days suspension, could be dynamic
            student.penaltyEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
        }

        await student.save();

        await logAction({
            userId: req.user._id,
            userModel: 'Admin',
            operatorName: req.user.name,
            role: 'Admin',
            action: 'Toggle Suspend',
            module: 'Admin',
            recordId: student._id.toString(),
            description: `Admin changed suspension status for ${student.studentId} to ${student.status}.`
        });

        res.json({ message: `Student ${student.name} is now ${student.status}.`, student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all active or pending bookings
// @route   GET /api/admin/sessions
// @access  Private/Admin
const getActiveSessions = async (req, res) => {
    try {
        const sessions = await Booking.find({ status: { $in: ['Confirmed', 'Active'] } })
            .populate('student', 'name studentId email')
            .populate('assignedComputer', 'pcId location')
            .populate('timeSlot', 'slotName startTime endTime');
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

        booking.status = 'Cancelled';
        booking.cancellationReason = 'Terminated by Administrator';
        if (booking.status === 'Active') {
            booking.checkOutTime = new Date();
        }
        await booking.save();

        const computer = await Computer.findById(booking.assignedComputer);
        if (computer) {
            computer.status = 'Available';
            await computer.save();
        }

        res.json({ message: 'Session terminated successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a Computer
// @route   DELETE /api/admin/computers/:id
// @access  Private/Admin
const deleteComputer = async (req, res) => {
    try {
        const computer = await Computer.findById(req.params.id);
        if (!computer) {
            return res.status(404).json({ message: 'Computer not found' });
        }

        await Computer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Computer deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reported issue tickets
// @route   GET /api/admin/issues
// @access  Private/Admin
const getIssues = async (req, res) => {
    try {
        const issues = await Computer.find({ status: { $in: ['Maintenance', 'Decommissioned', 'Damaged', 'Out of Service'] } });
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
        const computer = await Computer.findById(req.params.id);
        if (!computer) {
            return res.status(404).json({ message: 'Computer not found' });
        }

        computer.status = 'Available';
        await computer.save();

        res.json({ message: 'Issue marked as resolved. Computer is now available.', computer });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getPendingApprovals,
    approveStudent,
    rejectStudent,
    getStudents,
    toggleSuspendStudent,
    getActiveSessions,
    cancelSession,
    deleteComputer,
    getIssues,
    resolveIssue
};
