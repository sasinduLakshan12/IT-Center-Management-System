const Student = require('../models/Student');
const Admin = require('../models/Admin');
const PasswordResetToken = require('../models/PasswordResetToken');
const LoginHistory = require('../models/LoginHistory');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const Department = require('../models/Department');
const DegreeProgramme = require('../models/DegreeProgramme');

// Helper to generate access & refresh tokens
const generateTokens = (id) => {
    const accessToken = jwt.sign(
        { id },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

// Password checker helper
const validatePasswordStrength = (pwd) => {
    const minLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    return (
        minLength &&
        hasUpper &&
        hasLower &&
        hasNumber &&
        hasSpecial
    );
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
            phone,
            department,
            degreeProgramme,
            academicYear,
            semester,
            password,
            confirmPassword,
            agreedToTerms
        } = req.body;

        // Support old frontend field names
        const academicYearVal = academicYear || req.body.year;
        const degreeProgrammeVal =
            degreeProgramme || req.body.programme;

        // Remove uploaded files when registration fails
        const cleanFiles = () => {
            if (!req.files) {
                return;
            }

            if (
                req.files.idCardImage &&
                req.files.idCardImage[0]
            ) {
                const idCardFile =
                    req.files.idCardImage[0].path;

                if (fs.existsSync(idCardFile)) {
                    fs.unlinkSync(idCardFile);
                }
            }

            if (
                req.files.profileImage &&
                req.files.profileImage[0]
            ) {
                const profileFile =
                    req.files.profileImage[0].path;

                if (fs.existsSync(profileFile)) {
                    fs.unlinkSync(profileFile);
                }
            }
        };

        // Resolve department name to MongoDB ObjectId
        let resolvedDeptId = department;

        if (
            department &&
            typeof department === 'string' &&
            department.length !== 24
        ) {
            let dept = await Department.findOne({
                name: department
            });

            if (!dept) {
                const code = department
                    .replace(/Department of/gi, '')
                    .trim()
                    .split(/\s+/)
                    .map((word) => word[0])
                    .join('')
                    .toUpperCase();

                dept = await Department.create({
                    name: department,
                    code: code || 'DEPT',
                    description:
                        `Auto-generated department for ${department}`
                });
            }

            resolvedDeptId = dept._id;
        }

        // Resolve programme name to MongoDB ObjectId
        let resolvedProgId = degreeProgrammeVal;

        if (
            degreeProgrammeVal &&
            typeof degreeProgrammeVal === 'string' &&
            degreeProgrammeVal.length !== 24
        ) {
            let programme =
                await DegreeProgramme.findOne({
                    name: degreeProgrammeVal
                });

            if (!programme) {
                const code = degreeProgrammeVal
                    .replace(/BSc \(Hons\)/gi, '')
                    .replace(/HND/gi, '')
                    .trim()
                    .split(/\s+/)
                    .map((word) => word[0])
                    .join('')
                    .toUpperCase();

                programme =
                    await DegreeProgramme.create({
                        name: degreeProgrammeVal,
                        code: code || 'PROG',
                        department: resolvedDeptId,
                        duration: 4
                    });
            }

            resolvedProgId = programme._id;
        }

        // Required field validation
        if (
            !studentId ||
            !name ||
            !email ||
            !phone ||
            !resolvedDeptId ||
            !resolvedProgId ||
            !academicYearVal ||
            !semester ||
            !password
        ) {
            cleanFiles();

            return res.status(400).json({
                message:
                    'All required fields must be filled.'
            });
        }

        if (password !== confirmPassword) {
            cleanFiles();

            return res.status(400).json({
                message: 'Passwords do not match.'
            });
        }

        if (!validatePasswordStrength(password)) {
            cleanFiles();

            return res.status(400).json({
                message:
                    'Password must be at least 8 characters long, and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
            });
        }

        if (
            agreedToTerms !== 'true' &&
            agreedToTerms !== true
        ) {
            cleanFiles();

            return res.status(400).json({
                message:
                    'You must agree to the terms and conditions.'
            });
        }

        // Check whether email already exists
        const normalizedEmail = email.toLowerCase().trim();

        const emailExists =
            await Student.findOne({
                email: normalizedEmail
            }) ||
            await Admin.findOne({
                email: normalizedEmail
            });

        if (emailExists) {
            cleanFiles();

            return res.status(400).json({
                message:
                    'Email address is already registered.'
            });
        }

        // Check whether Student ID already exists
        const normalizedStudentId =
            studentId.toUpperCase().trim();

        const idExists =
            await Student.findOne({
                studentId: normalizedStudentId
            }) ||
            await Admin.findOne({
                studentId: normalizedStudentId
            });

        if (idExists) {
            cleanFiles();

            return res.status(400).json({
                message:
                    'Student ID is already registered.'
            });
        }

        // Hash student password
        const salt = await bcrypt.genSalt(10);

        const hashedPassword =
            await bcrypt.hash(password, salt);

        // Uploaded images are optional
        const idCardPath =
            req.files &&
                req.files.idCardImage &&
                req.files.idCardImage[0]
                ? req.files.idCardImage[0].filename
                : '';

        const profilePath =
            req.files &&
                req.files.profileImage &&
                req.files.profileImage[0]
                ? req.files.profileImage[0].filename
                : '';

        // Create the student account.
        // Email verification has been removed,
        // therefore the account is approved immediately.
        const student = await Student.create({
            studentId: normalizedStudentId,
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            department: resolvedDeptId,
            degreeProgramme: resolvedProgId,
            academicYear: academicYearVal,
            semester,
            password: hashedPassword,
            idCardImage: idCardPath,
            profileImage: profilePath,
            status: 'Approved',
            loginAttempts: 0,
            lockUntil: null
        });

        return res.status(201).json({
            success: true,
            message:
                'Registration successful! You can now log in to your account.',
            data: {
                _id: student._id,
                studentId: student.studentId,
                name: student.name,
                email: student.email,
                status: student.status
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'An error occurred during registration.'
        });
    }
};

// @desc    Authenticate User (Student/Admin)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const ipAddress =
        req.ip ||
        req.connection.remoteAddress ||
        '';

    const deviceInfo =
        req.headers['user-agent'] || '';

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    'Please enter your email and password.'
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // Search Admin collection first
        let user = await Admin.findOne({
            email: normalizedEmail
        });

        let userModel = 'Admin';

        // Search Student collection if Admin was not found
        if (!user) {
            user = await Student.findOne({
                email: normalizedEmail
            });

            userModel = 'Student';
        }

        if (!user) {
            await LoginHistory.create({
                email: normalizedEmail,
                isSuccess: false,
                failureReason: 'User not found',
                ipAddress,
                deviceInfo
            });

            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check whether account is temporarily locked
        if (
            user.lockUntil &&
            user.lockUntil > new Date()
        ) {
            const minutesLeft = Math.ceil(
                (
                    new Date(user.lockUntil) -
                    Date.now()
                ) / 60000
            );

            return res.status(403).json({
                message:
                    `Account is temporarily locked. ` +
                    `Try again in ${minutesLeft} minute(s).`
            });
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            user.loginAttempts =
                (user.loginAttempts || 0) + 1;

            let locked = false;

            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(
                    Date.now() +
                    15 * 60 * 1000
                );

                user.loginAttempts = 0;
                locked = true;
            }

            await user.save();

            await LoginHistory.create({
                userId: user._id,
                userModel,
                email: normalizedEmail,
                isSuccess: false,
                failureReason: locked
                    ? 'Maximum failed login attempts exceeded. Account locked.'
                    : 'Incorrect password',
                ipAddress,
                deviceInfo
            });

            return res.status(401).json({
                message: locked
                    ? 'Maximum failed attempts reached. Account has been locked for 15 minutes.'
                    : `Invalid email or password. ${5 - user.loginAttempts
                    } attempt(s) remaining.`
            });
        }

        // Student account restrictions
        if (userModel === 'Student') {

            if (user.status === 'Rejected') {
                return res.status(403).json({
                    status: 'Rejected',
                    message:
                        `Your registration request was rejected by the administrator.` +
                        `${user.rejectionReason ? ` Reason: ${user.rejectionReason}` : ''}`
                });
            }

            if (user.status === 'Suspended') {
                return res.status(403).json({
                    status: 'Suspended',
                    message:
                        user.penaltyEnd &&
                            user.penaltyEnd > new Date()
                            ? `Your account is temporarily suspended until ${user.penaltyEnd.toLocaleString()} due to policy violations.`
                            : 'Your account is suspended. Please contact the IT Center administrator.'
                });
            }

            if (user.status === 'Deactivated') {
                return res.status(403).json({
                    status: 'Deactivated',
                    message:
                        'Your account is deactivated. Please contact the administrator.'
                });
            }
        }

        // Reset failed login tracking after successful authentication
        user.loginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const { accessToken, refreshToken } =
            generateTokens(user._id);

        await LoginHistory.create({
            userId: user._id,
            userModel,
            email: normalizedEmail,
            isSuccess: true,
            ipAddress,
            deviceInfo
        });

        return res.json({
            success: true,
            _id: user._id,
            studentId: user.studentId,
            name: user.name,
            email: user.email,
            role: user.role || 'student',
            status:
                userModel === 'Student'
                    ? user.status
                    : 'Approved',
            token: accessToken,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'An error occurred during login.'
        });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email address is required.'
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        let user = await Student.findOne({
            email: normalizedEmail
        });

        let userModel = 'Student';

        if (!user) {
            user = await Admin.findOne({
                email: normalizedEmail
            });

            userModel = 'Admin';
        }

        if (!user) {
            return res.status(404).json({
                message:
                    'No user registered with this email address.'
            });
        }

        // Remove any old password reset tokens
        await PasswordResetToken.deleteMany({
            userId: user._id
        });

        const resetToken =
            crypto.randomBytes(32).toString('hex');

        await PasswordResetToken.create({
            userId: user._id,
            userModel,
            token: resetToken
        });

        const clientUrl =
            process.env.CLIENT_URL ||
            'http://localhost:5173';

        const resetUrl =
            `${clientUrl}/reset-password?token=${resetToken}`;

        console.log(
            '--- [MOCK PASSWORD RESET LINK] ---'
        );
        console.log(`To: ${normalizedEmail}`);
        console.log(`Link: ${resetUrl}`);
        console.log('-----------------------------------');

        return res.json({
            success: true,
            message:
                'Password reset link generated. Please check console logs or mock mail for the link.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Unable to create password reset link.'
        });
    }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const {
            token,
            password,
            confirmPassword
        } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message:
                    'Token and new password are required.'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: 'Passwords do not match.'
            });
        }

        if (!validatePasswordStrength(password)) {
            return res.status(400).json({
                message:
                    'Password does not meet complexity requirements.'
            });
        }

        const resetToken =
            await PasswordResetToken.findOne({
                token
            });

        if (!resetToken) {
            return res.status(400).json({
                message:
                    'Invalid or expired password reset token.'
            });
        }

        let user;

        if (resetToken.userModel === 'Student') {
            user = await Student.findById(
                resetToken.userId
            );
        } else {
            user = await Admin.findById(
                resetToken.userId
            );
        }

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            password,
            salt
        );

        user.loginAttempts = 0;
        user.lockUntil = null;

        await user.save();

        await PasswordResetToken.findByIdAndDelete(
            resetToken._id
        );

        return res.json({
            success: true,
            message:
                'Password has been reset successfully. You can now log in.'
        });
    } catch (error) {
        console.error('Reset password error:', error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Unable to reset password.'
        });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const {
            oldPassword,
            newPassword,
            confirmNewPassword
        } = req.body;

        if (
            !oldPassword ||
            !newPassword ||
            !confirmNewPassword
        ) {
            return res.status(400).json({
                message:
                    'All password fields are required.'
            });
        }

        if (
            newPassword !== confirmNewPassword
        ) {
            return res.status(400).json({
                message:
                    'New passwords do not match.'
            });
        }

        if (
            !validatePasswordStrength(
                newPassword
            )
        ) {
            return res.status(400).json({
                message:
                    'New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.'
            });
        }

        let user;

        if (req.user.role === 'admin') {
            user = await Admin.findById(
                req.user._id
            );
        } else {
            user = await Student.findById(
                req.user._id
            );
        }

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        const isMatch = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message:
                    'Current password is incorrect.'
            });
        }

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(
            newPassword,
            salt
        );

        await user.save();

        return res.json({
            success: true,
            message:
                'Password changed successfully.'
        });
    } catch (error) {
        console.error(
            'Change password error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Unable to change password.'
        });
    }
};

module.exports = {
    registerStudent,
    loginUser,
    forgotPassword,
    resetPassword,
    changePassword
};