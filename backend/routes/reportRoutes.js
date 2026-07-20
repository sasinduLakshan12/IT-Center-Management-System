const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getDashboardStats,
    getUtilizationReport,
    getAuditLogs,
    getPublicStats
} = require('../controllers/reportController');

router.get('/public-stats', getPublicStats);

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/utilization', getUtilizationReport);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
