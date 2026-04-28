/**
 * ========================================
 * THOZHI - Email Service
 * ========================================
 * Uses Gmail App Password via Nodemailer.
 */

const nodemailer = require('nodemailer');

function getTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER and EMAIL_PASS are required for OTP email delivery.');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

exports.sendOTPEmail = async (email, otp) => {
    try {
        const transporter = getTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Thozhi OTP',
            text: `Your OTP is ${otp}. Valid for 5 minutes.`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email] Email sent to ${email}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email] Email send failed:', error.message);
        return { success: false, error: error.message };
    }
};
