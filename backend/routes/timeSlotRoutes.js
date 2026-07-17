const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot
} = require('../controllers/timeSlotController');

// Public/student access to view slots
router.get('/', protect, getTimeSlots);

// Admin only access to modify slots
router.post('/', protect, adminOnly, createTimeSlot);
router.put('/:id', protect, adminOnly, updateTimeSlot);
router.delete('/:id', protect, adminOnly, deleteTimeSlot);

module.exports = router;
