const nodemailer = require('nodemailer');

const createTransporter = () => {
    // If SMTP variables are not fully set, return a mock transporter
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn('SMTP credentials missing. Email Service running in Mock mode (logs to console).');
        return {
            sendMail: async (options) => {
                console.log('--- [MOCK EMAIL SENT] ---');
                console.log(`To: ${options.to}`);
                console.log(`Subject: ${options.subject}`);
                console.log(`Body:\n${options.text || options.html}`);
                console.log('--------------------------');
                return { messageId: 'mock-id-' + Date.now() };
            }
        };
    }

    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

const transporter = createTransporter();
const fromEmail = process.env.EMAIL_FROM || 'itcenter@univ.ac.lk';

const sendVerificationEmail = async (student, token) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #1e3a8a; text-align: center;">Verify Your Email Address</h2>
            <p>Dear ${student.name},</p>
            <p>Thank you for registering at the University IT Center Computer Booking and Time Management System. Please verify your email by clicking the link below:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p>This verification link will expire in 24 hours. If you did not register for this account, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;">IT Center Management System, University of Vocational Technology</p>
        </div>
    `;

    return transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: 'Verify your IT Center Account Email',
        html
    });
};

const sendApprovalEmail = async (student) => {
    const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/login`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #10b981; text-align: center;">Account Approved</h2>
            <p>Dear ${student.name},</p>
            <p>Great news! Your IT Center booking account has been approved by the administrator.</p>
            <p>You can now sign in and reserve computers for your time slots.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;">IT Center Management System</p>
        </div>
    `;

    return transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: 'Your IT Center Account has been Approved!',
        html
    });
};

const sendRejectionEmail = async (student, reason) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #ef4444; text-align: center;">Account Registration Rejected</h2>
            <p>Dear ${student.name},</p>
            <p>Your registration request at the IT Center was reviewed and unfortunately rejected.</p>
            <p><strong>Reason for rejection:</strong> ${reason}</p>
            <p>If you believe this was an error, please contact the administrator at ${fromEmail} or submit another registration with updated details.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;">IT Center Management System</p>
        </div>
    `;

    return transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: 'IT Center Account Registration Rejected',
        html
    });
};

const sendBookingConfirmation = async (student, bookingDetails) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #1e3a8a; text-align: center;">Booking Confirmed</h2>
            <p>Dear ${student.name},</p>
            <p>Your computer booking is confirmed. Details below:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f3f4f6;">
                    <td style="padding: 10px; font-weight: bold;">Reference Number:</td>
                    <td style="padding: 10px; font-family: monospace;">${bookingDetails.referenceNumber}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Date:</td>
                    <td style="padding: 10px;">${new Date(bookingDetails.bookingDate).toDateString()}</td>
                </tr>
                <tr style="background-color: #f3f4f6;">
                    <td style="padding: 10px; font-weight: bold;">Time Slot:</td>
                    <td style="padding: 10px;">${bookingDetails.slotDetails}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Assigned PC:</td>
                    <td style="padding: 10px; font-weight: bold; color: #2563eb;">${bookingDetails.computerName}</td>
                </tr>
            </table>
            <p style="color: #ef4444; font-weight: bold;">Important: You must check-in within 10 minutes of booking start time. Otherwise, your booking will be marked as Missed and your access might be restricted.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;">IT Center Management System</p>
        </div>
    `;

    return transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: `Booking Confirmed: ${bookingDetails.referenceNumber}`,
        html
    });
};

const sendBookingCancellation = async (student, bookingDetails, reason) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #ef4444; text-align: center;">Booking Cancelled</h2>
            <p>Dear ${student.name},</p>
            <p>Your computer booking has been cancelled. Details below:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f3f4f6;">
                    <td style="padding: 10px; font-weight: bold;">Reference Number:</td>
                    <td style="padding: 10px; font-family: monospace;">${bookingDetails.referenceNumber}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold;">Original Date:</td>
                    <td style="padding: 10px;">${new Date(bookingDetails.bookingDate).toDateString()}</td>
                </tr>
                <tr style="background-color: #f3f4f6;">
                    <td style="padding: 10px; font-weight: bold;">Cancellation Reason:</td>
                    <td style="padding: 10px; color: #ef4444;">${reason}</td>
                </tr>
            </table>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;">IT Center Management System</p>
        </div>
    `;

    return transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: `Booking Cancelled: ${bookingDetails.referenceNumber}`,
        html
    });
};

const sendWaitingListAlert = async (student, date, slotName) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #8b5cf6; text-align: center;">Computer Available - Action Required!</h2>
            <p>Dear ${student.name},</p>
            <p>A computer has become available for your requested time slot on <strong>${new Date(date).toDateString()} (${slotName})</strong>.</p>
            <p>Please log in to your dashboard within <strong>15 minutes</strong> to confirm this booking. If you do not confirm within this timeframe, the slot will be offered to the next student in the queue.</p>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p style="font-size: 12px; color: #777777;">IT Center Management System</p>
        </div>
    `;

    return transporter.sendMail({
        from: fromEmail,
        to: student.email,
        subject: 'IT Center: Computer Available on Waiting List',
        html
    });
};

module.exports = {
    sendVerificationEmail,
    sendApprovalEmail,
    sendRejectionEmail,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendWaitingListAlert
};
