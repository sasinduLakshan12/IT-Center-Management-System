const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    createBooking,
    cancelBooking,
    getMyBookings,
    getAllBookings
} = require('../controllers/bookingController');

// All routes require authentication
router.use(protect);

// Student Routes
router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);

// Shared Routes (Student or Admin can cancel)
router.put('/:id/cancel', cancelBooking);

// Admin Routes
router.get('/', adminOnly, getAllBookings);

module.exports = router;
