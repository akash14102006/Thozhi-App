/**
 * ========================================
 * THOZHI - Email Service
 * ========================================
 * Uses Gmail App Password via Nodemailer.
 */

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (!transporter) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER and EMAIL_PASS are required for OTP email delivery.');
        }

        transporter = nodemailer.createTransport({
            service: 'gmail',
            pool: true,             // Enable connection pooling
            maxConnections: 5,      // Maintain up to 5 concurrent SMTP connections
            maxMessages: 100,       // Max messages per connection before recycling
            rateDelta: 1000,
            rateLimit: 5,           // Rate limit to prevent SMTP flooding
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    return transporter;
}

exports.sendOTPEmail = async (email, otp) => {
    try {
        const poolTransporter = getTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Thozhi OTP',
            text: `Your OTP is ${otp}. Valid for 5 minutes.`,
        };

        const info = await poolTransporter.sendMail(mailOptions);
        console.log(`[Email] Email sent to ${email}. MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('[Email] Email send failed:', error.message);
        return { success: false, error: error.message };
    }
};

