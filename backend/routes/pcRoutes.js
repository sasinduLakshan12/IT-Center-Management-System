const express = require('express');
const router = express.Router();
const { getPCs, addPC, updatePCStatus } = require('../controllers/pcController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPCs)
    .post(protect, adminOnly, addPC);

router.route('/:id/status')
    .put(protect, adminOnly, updatePCStatus);

module.exports = router;
