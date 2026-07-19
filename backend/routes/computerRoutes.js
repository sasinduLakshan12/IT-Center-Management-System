const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getComputers,
    addComputer,
    updateComputer,
    deleteComputer,
    exportComputers,
    importComputers,
    bulkGenerateComputers
} = require('../controllers/computerController');

router.route('/')
    .get(protect, getComputers)
    .post(protect, adminOnly, addComputer);

router.route('/bulk-generate')
    .post(protect, adminOnly, bulkGenerateComputers);

router.route('/export')
    .get(protect, adminOnly, exportComputers);

router.route('/import')
    .post(protect, adminOnly, upload.single('csvFile'), importComputers);

router.route('/:id')
    .put(protect, adminOnly, updateComputer)
    .delete(protect, adminOnly, deleteComputer);

module.exports = router;
