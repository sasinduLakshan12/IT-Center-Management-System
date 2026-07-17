const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All routes here require protection and adminOnly
router.use(protect);
router.use(adminOnly);

// Basic stats
router.get('/stats', getStats);

// User approvals
router.get('/pending-approvals', getPendingApprovals);
router.put('/approve-student/:id', approveStudent);
router.put('/reject-student/:id', rejectStudent); // Changed to PUT because it's a status update, not a DELETE according to PRD

// User management
router.get('/students', getStudents);
router.put('/students/:id/suspend', toggleSuspendStudent);

// Sessions management
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', cancelSession);

// PC management additions
router.delete('/computers/:id', deleteComputer);

// Issue resolution
router.get('/issues', getIssues);
router.put('/issues/:id/resolve', resolveIssue);

module.exports = router;
