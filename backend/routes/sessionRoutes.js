const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { checkIn, checkOut } = require('../controllers/sessionController');

router.use(protect);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

module.exports = router;
