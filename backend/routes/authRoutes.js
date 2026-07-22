const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const { protect } = require('../middleware/authMiddleware');
const {
    registerStudent,
    loginUser,
    googleLogin,
    forgotPassword,
    resetPassword,
    changePassword
} = require('../controllers/authController');

router.post('/register', upload.fields([
    { name: 'idCardImage', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
]), registerStudent);

router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.put('/change-password', protect, changePassword);

module.exports = router;
