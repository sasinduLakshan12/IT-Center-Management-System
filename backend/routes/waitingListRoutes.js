const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getMyWaitingList, getAllWaitingList } = require('../controllers/waitingListController');

router.use(protect);

router.get('/my-status', getMyWaitingList);
router.get('/', adminOnly, getAllWaitingList);

module.exports = router;
