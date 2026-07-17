const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getProgrammes,
    createProgramme,
    updateProgramme,
    deleteProgramme
} = require('../controllers/programmeController');

router.route('/')
    .get(getProgrammes)
    .post(protect, adminOnly, createProgramme);

router.route('/:id')
    .put(protect, adminOnly, updateProgramme)
    .delete(protect, adminOnly, deleteProgramme);

module.exports = router;
