const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

            // Find user in Admin collection
            let user = await Admin.findById(decoded.id).select('-password');
            let role = 'admin';

            // If not admin, look in Student collection
            if (!user) {
                user = await Student.findById(decoded.id).select('-password');
                role = 'student';
            }

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // If student, check if they are suspended or deactivated
            if (role === 'student') {
                if (user.status !== 'Approved') {
                    return res.status(403).json({ 
                        message: `Access denied. Your account status is: ${user.status}.`, 
                        status: user.status 
                    });
                }
                if (user.penaltyStatus === 'Suspended' && user.penaltyEnd && user.penaltyEnd > new Date()) {
                    return res.status(403).json({
                        message: `Your account is temporarily suspended until ${user.penaltyEnd.toLocaleString()} due to policy violations.`,
                        status: 'Suspended'
                    });
                }
            }

            req.user = user;
            req.user.role = role; // attach role dynamically
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminOnly };
