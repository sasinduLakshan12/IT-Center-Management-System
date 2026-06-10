const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/adminController');

// All routes here require protection and adminOnly
router.use(protect);
router.use(adminOnly);

// Basic stats
router.get('/stats', getStats);

// User approvals
router.get('/pending-approvals', getPendingApprovals);
router.put('/approve-user/:id', approveUser);
router.delete('/reject-user/:id', rejectUser);

// User management
router.get('/users', getUsers);
router.put('/users/:id/block', toggleBlockUser);

// Sessions management
router.get('/sessions', getActiveSessions);
router.delete('/sessions/:id', cancelSession);

// PC management additions
router.delete('/pcs/:id', deletePC);

// Issue resolution
router.get('/issues', getIssues);
router.put('/issues/:id/resolve', resolveIssue);

module.exports = router;
