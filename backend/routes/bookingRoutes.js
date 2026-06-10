const express = require('express');
const router = express.Router();
const { bookPC, checkIn, checkOut, getMyActiveBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-active', protect, getMyActiveBooking);
router.post('/', protect, bookPC);
router.put('/:id/checkin', protect, checkIn);
router.put('/:id/checkout', protect, checkOut);

module.exports = router;
