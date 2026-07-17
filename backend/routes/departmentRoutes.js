const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require('../controllers/departmentController');

router.route('/')
    .get(getDepartments) // student can fetch for register page (no auth needed or dynamic)
    .post(protect, adminOnly, createDepartment);

router.route('/:id')
    .put(protect, adminOnly, updateDepartment)
    .delete(protect, adminOnly, deleteDepartment);

module.exports = router;
