const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getSettings,
    updateSettings,
    getClosedPeriods,
    createClosedPeriod,
    deleteClosedPeriod
} = require('../controllers/settingsController');

router.route('/')
    .get(getSettings) // public read-only (needed by login/registration/student pages)
    .put(protect, adminOnly, updateSettings);

router.route('/closures')
    .get(getClosedPeriods)
    .post(protect, adminOnly, createClosedPeriod);

router.route('/closures/:id')
    .delete(protect, adminOnly, deleteClosedPeriod);

module.exports = router;
