const Student = require('../models/Student');
const Admin = require('../models/Admin');
const VerificationToken = require('../models/VerificationToken');
const PasswordResetToken = require('../models/PasswordResetToken');
const LoginHistory = require('../models/LoginHistory');
const { sendVerificationEmail, sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
const { logAction } = require('../utils/auditLogger');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Helper to generate access & refresh tokens
const generateTokens = (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret', { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// Password checker helper
const validatePasswordStrength = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
const registerStudent = async (req, res) => {
    try {
        const {
            studentId,
            name,
            email,
            personalEmail,
            phone,
            department,
            degreeProgramme,
            academicYear,
            semester,
            password,
            confirmPassword,
            agreedToTerms
        } = req.body;

        // Clean files if failure occurs
        const cleanFiles = () => {
            if (req.files) {
                if (req.files.idCardImage && req.files.idCardImage[0]) {
                    fs.unlinkSync(req.files.idCardImage[0].path);
                }
                if (req.files.profileImage && req.files.profileImage[0]) {
                    fs.unlinkSync(req.files.profileImage[0].path);
                }
            }
        };

        // Standard validation
        if (!studentId || !name || !email || !phone || !department || !degreeProgramme || !academicYear || !semester || !password) {
            cleanFiles();
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        if (password !== confirmPassword) {
            cleanFiles();
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (!validatePasswordStrength(password)) {
            cleanFiles();
            return res.status(400).json({
                message: 'Password must be at least 8 characters long, and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
            });
        }

        if (agreedToTerms !== 'true' && agreedToTerms !== true) {
            cleanFiles();
            return res.status(400).json({ message: 'You must agree to the terms and conditions.' });
        }

        if (!req.files || !req.files.idCardImage || !req.files.idCardImage[0]) {
            return res.status(400).json({ message: 'Student ID card image is required for registration.' });
        }

        // Check uniqueness
        const emailExists = await Student.findOne({ email: email.toLowerCase() }) || await Admin.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            cleanFiles();
            return res.status(400).json({ message: 'University email is already registered.' });
        }

        const idExists = await Student.findOne({ studentId: studentId.toUpperCase() }) || await Admin.findOne({ studentId: studentId.toUpperCase() });
        if (idExists) {
            cleanFiles();
            return res.status(400).json({ message: 'Student ID is already registered.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const idCardPath = req.files.idCardImage[0].filename;
        const profilePath = req.files.profileImage && req.files.profileImage[0] ? req.files.profileImage[0].filename : '';

        // Create student
        const student = await Student.create({
            studentId: studentId.toUpperCase(),
            name,
            email: email.toLowerCase(),
            personalEmail: personalEmail ? personalEmail.toLowerCase() : '',
            phone,
            department,
            degreeProgramme,
            academicYear,
            semester,
            password: hashedPassword,
            idCardImage: idCardPath,
            profileImage: profilePath,
            status: 'Email Verification Pending'
        });

        // Generate email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        await VerificationToken.create({
            student: student._id,
            token: verificationToken
        });

        // Send email
        await sendVerificationEmail(student, verificationToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your address.'
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify student email address
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required.' });
        }

        const vToken = await VerificationToken.findOne({ token });
        if (!vToken) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        const student = await Student.findById(vToken.student);
        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (student.status !== 'Email Verification Pending') {
            return res.status(400).json({ message: 'Account is already verified or active.' });
        }

        // Update status to Pending Approval
        student.status = 'Pending Approval';
        await student.save();

        // Clean up token
        await VerificationToken.findByIdAndDelete(vToken._id);

        // Audit Log
        await logAction({
            userId: student._id,
            userModel: 'Student',
            operatorName: student.name,
            role: 'Student',
            action: 'Email Verification',
            module: 'Auth',
            recordId: student._id.toString(),
            description: `Student ${student.name} successfully verified email. Account status changed to Pending Approval.`
        });

        res.json({
            success: true,
            message: 'Email verified successfully! Your account is now pending admin approval. You will be notified once reviewed.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const student = await Student.findOne({ email: email.toLowerCase() });
        if (!student) {
            return res.status(404).json({ message: 'Student account not found.' });
        }

        if (student.status !== 'Email Verification Pending') {
            return res.status(400).json({ message: 'Email is already verified.' });
        }

        // Rate limit resending: look for existing token and check cooldown (e.g. 60 seconds)
        const existingToken = await VerificationToken.findOne({ student: student._id });
        if (existingToken) {
            const timePassed = Date.now() - new Date(existingToken.createdAt).getTime();
            if (timePassed < 60 * 1000) {
                return res.status(429).json({ message: 'Please wait 60 seconds before requesting another email.' });
            }
            await VerificationToken.findByIdAndDelete(existingToken._id);
        }

        const newToken = crypto.randomBytes(32).toString('hex');
        await VerificationToken.create({
            student: student._id,
            token: newToken
        });

        await sendVerificationEmail(student, newToken);

        res.json({
            success: true,
            message: 'Verification email resent successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate User (Student/Admin)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const deviceInfo = req.headers['user-agent'] || '';

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }

        // 1. Search in Admin first, then Student
        let user = await Admin.findOne({ email: email.toLowerCase() });
        let userModel = 'Admin';

        if (!user) {
            user = await Student.findOne({ email: email.toLowerCase() });
            userModel = 'Student';
        }

        if (!user) {
            // Write failure history
            await LoginHistory.create({ email, isSuccess: false, failureReason: 'User not found', ipAddress, deviceInfo });
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 2. Check if account is locked
        if (user.lockUntil && user.lockUntil > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.lockUntil) - Date.now()) / 60000);
            return res.status(403).json({
                message: `Account is temporarily locked. Try again in ${minutesLeft} minute(s).`
            });
        }

        // 3. Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            user.loginAttempts += 1;
            let locked = false;

            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
                user.loginAttempts = 0;
                locked = true;
            }

            await user.save();

            // Log fail
            await LoginHistory.create({
                userId: user._id,
                userModel,
                email,
                isSuccess: false,
                failureReason: locked ? 'Max failed login attempts exceeded. Account locked.' : 'Incorrect password',
                ipAddress,
                deviceInfo
            });

            return res.status(401).json({
                message: locked
                    ? 'Maximum failed attempts reached. Account has been locked for 15 minutes.'
                    : `Invalid email or password. ${5 - user.loginAttempts} attempt(s) remaining.`
            });
        }

        // 4. Validate Student Status (Admins bypass status check)
        if (userModel === 'Student') {
            if (user.status === 'Email Verification Pending') {
                return res.status(403).json({
                    status: 'VerificationPending',
                    message: 'Your email address is not verified. Please verify your email first.'
                });
            }

            if (user.status === 'Pending Approval') {
                return res.status(403).json({
                    status: 'PendingApproval',
                    message: 'Your registration is pending administrator approval. Please wait.'
                });
            }

            if (user.status === 'Rejected') {
                return res.status(403).json({
                    status: 'Rejected',
                    message: `Your registration request was rejected by the administrator. Reason: ${user.rejectionReason}`
                });
            }

            if (user.status === 'Suspended') {
                return res.status(403).json({
                    status: 'Suspended',
                    message: user.penaltyEnd && user.penaltyEnd > new Date()
                        ? `Your account is temporarily suspended until ${user.penaltyEnd.toLocaleString()} due to policy violations.`
                        : 'Your account is suspended. Please contact the IT Center administrator.'
                });
            }

            if (user.status === 'Deactivated') {
                return res.status(403).json({
                    status: 'Deactivated',
                    message: 'Your account is deactivated. Please contact the administrator.'
                });
            }
        }

        // 5. Successful Login
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const { accessToken, refreshToken } = generateTokens(user._id);

        // Record history
        await LoginHistory.create({
            userId: user._id,
            userModel,
            email,
            isSuccess: true,
            ipAddress,
            deviceInfo
        });

        res.json({
            success: true,
            _id: user._id,
            studentId: user.studentId,
            name: user.name,
            email: user.email,
            role: user.role || 'student',
            status: userModel === 'Student' ? user.status : 'Approved',
            token: accessToken,
            refreshToken
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        // Find user
        let user = await Student.findOne({ email: email.toLowerCase() });
        let userModel = 'Student';

        if (!user) {
            user = await Admin.findOne({ email: email.toLowerCase() });
            userModel = 'Admin';
        }

        if (!user) {
            return res.status(404).json({ message: 'No user registered with this email address.' });
        }

        // Check if there's an existing token
        await PasswordResetToken.deleteMany({ userId: user._id });

        const resetToken = crypto.randomBytes(32).toString('hex');
        await PasswordResetToken.create({
            userId: user._id,
            userModel,
            token: resetToken
        });

        // Email details
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

        console.log(`--- [MOCK PASSWORD RESET LINK] ---`);
        console.log(`To: ${email}`);
        console.log(`Link: ${resetUrl}`);
        console.log(`-----------------------------------`);

        res.json({
            success: true,
            message: 'Password reset link generated. Please check console logs or mock mail for link.'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (!validatePasswordStrength(password)) {
            return res.status(400).json({ message: 'Password does not meet complexity requirements.' });
        }

        const resetToken = await PasswordResetToken.findOne({ token });
        if (!resetToken) {
            return res.status(400).json({ message: 'Invalid or expired password reset token.' });
        }

        // Find user
        let user;
        if (resetToken.userModel === 'Student') {
            user = await Student.findById(resetToken.userId);
        } else {
            user = await Admin.findById(resetToken.userId);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Update password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Delete token
        await PasswordResetToken.findByIdAndDelete(resetToken._id);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in.'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'All password fields are required.' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }

        if (!validatePasswordStrength(newPassword)) {
            return res.status(400).json({ message: 'New password does not meet complexity requirements.' });
        }

        // Fetch user from DB with password
        let user;
        if (req.user.role === 'admin') {
            user = await Admin.findById(req.user._id);
        } else {
            user = await Student.findById(req.user._id);
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully.'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerStudent,
    verifyEmail,
    resendVerification,
    loginUser,
    forgotPassword,
    resetPassword,
    changePassword
};
