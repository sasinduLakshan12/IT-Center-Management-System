const Booking = require('../models/Booking');
const Computer = require('../models/Computer');
const Student = require('../models/Student');
const WaitingList = require('../models/WaitingList');
const ComputerSession = require('../models/ComputerSession');
const AuditLog = require('../models/AuditLog');

// @desc    Get top-level dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);

        // Computers Stats
        const totalComputers = await Computer.countDocuments();
        const availableComputers = await Computer.countDocuments({ status: 'Available' });
        const inUseComputers = await Computer.countDocuments({ status: 'InUse' });
        const maintenanceComputers = await Computer.countDocuments({ status: 'Maintenance' });

        // Booking Stats for Today
        const totalBookingsToday = await Booking.countDocuments({ bookingDate: today });
        const activeSessions = await ComputerSession.countDocuments({ status: 'Active' });
        const completedSessionsToday = await ComputerSession.countDocuments({
            status: 'Completed',
            endTime: { $gte: today }
        });

        // Student Stats
        const totalStudents = await Student.countDocuments();
        const pendingApprovals = await Student.countDocuments({ status: 'Pending' });

        // Waiting List
        const waitingListSize = await WaitingList.countDocuments({
            bookingDate: today,
            status: 'Waiting'
        });

        res.json({
            success: true,
            data: {
                computers: {
                    total: totalComputers,
                    available: availableComputers,
                    inUse: inUseComputers,
                    maintenance: maintenanceComputers
                },
                bookings: {
                    todayTotal: totalBookingsToday,
                    activeSessions: activeSessions,
                    completedToday: completedSessionsToday,
                    waitingListSize: waitingListSize
                },
                students: {
                    total: totalStudents,
                    pendingApprovals: pendingApprovals
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get historical utilization report
// @route   GET /api/reports/utilization
// @access  Private/Admin
const getUtilizationReport = async (req, res) => {
    try {
        // We'll aggregate sessions to show usage over the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0,0,0,0);

        const sessions = await ComputerSession.aggregate([
            { $match: { startTime: { $gte: sevenDaysAgo } } },
            { 
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    totalSessions: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({ success: true, data: sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit logs
// @route   GET /api/reports/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const { module, action, operatorName } = req.query;
        let query = {};

        if (module) query.module = module;
        if (action) query.action = { $regex: action, $options: 'i' };
        if (operatorName) query.operatorName = { $regex: operatorName, $options: 'i' };

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            data: logs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUtilizationReport,
    getAuditLogs
};
