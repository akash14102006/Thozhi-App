/**
 * ========================================
 * THOZHI - OTP Controller
 * ========================================
 * Handles OTP generation, storage, validation, and rate limiting.
 * Uses MongoDB for persistent OTP state.
 */

const crypto = require('crypto');
const OtpCode = require('../models/OtpCode');
const emailService = require('../services/emailService');

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 60 * 1000;

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(email) {
    return String(email || '').toLowerCase().trim();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashOtp(otp) {
    const otpSecret = process.env.OTP_SECRET || 'thozhi-default-otp-secret';
    return crypto.createHash('sha256').update(`${otp}:${otpSecret}`).digest('hex');
}

exports.sendOTP = async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body?.email);

        if (!isValidEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide a valid email address.',
            });
        }

        const now = new Date();
        const existing = await OtpCode.findOne({ email: normalizedEmail });

        if (existing?.lastSentAt) {
            const elapsedMs = now.getTime() - existing.lastSentAt.getTime();
            if (elapsedMs < RATE_LIMIT_MS) {
                const waitSeconds = Math.ceil((RATE_LIMIT_MS - elapsedMs) / 1000);
                return res.status(429).json({
                    success: false,
                    error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
                    retryAfter: waitSeconds,
                });
            }
        }

        const otp = generateOTP();
        const otpHash = hashOtp(otp);
        const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

        await OtpCode.findOneAndUpdate(
            { email: normalizedEmail },
            {
                $set: {
                    otpHash,
                    expiresAt,
                    attempts: 0,
                    isVerified: false,
                    verifiedAt: null,
                    lastSentAt: now,
                },
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`[OTP] OTP generated for ${normalizedEmail}. Expires at: ${expiresAt.toISOString()}`);

        const emailResult = await emailService.sendOTPEmail(normalizedEmail, otp);

        if (!emailResult.success) {
            console.error('[OTP] Email send failed:', emailResult.error);

            if (process.env.NODE_ENV !== 'production') {
                console.log(`[OTP] DEV FALLBACK - OTP for ${normalizedEmail}: ${otp}`);
                return res.status(200).json({
                    success: true,
                    message: 'OTP generated. Email delivery is in dev fallback mode.',
                    expiresIn: '5 minutes',
                    devFallback: true,
                });
            }

            return res.status(500).json({
                success: false,
                error: emailResult.error || 'Failed to send email. Please try again.',
            });
        }

        console.log(`[OTP] Email sent to ${normalizedEmail}.`);
        return res.status(200).json({
            success: true,
            message: 'OTP sent to your email.',
            expiresIn: '5 minutes',
        });
    } catch (error) {
        console.error('[OTP] sendOTP failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Server error. Please try again.',
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const normalizedEmail = normalizeEmail(req.body?.email);
        const providedOtp = String(req.body?.otp || '').trim();

        if (!normalizedEmail || !providedOtp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required.',
            });
        }

        const otpDoc = await OtpCode.findOne({ email: normalizedEmail });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                error: 'OTP expired or not found. Please request a new one.',
                errorCode: 'OTP_NOT_FOUND',
            });
        }

        if (new Date() > otpDoc.expiresAt) {
            await OtpCode.deleteOne({ _id: otpDoc._id });
            return res.status(400).json({
                success: false,
                error: 'OTP has expired. Please request a new one.',
                errorCode: 'OTP_EXPIRED',
            });
        }

        if (otpDoc.attempts >= MAX_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                error: 'Too many failed attempts. Please request a new OTP.',
                errorCode: 'MAX_ATTEMPTS',
                attemptsRemaining: 0,
            });
        }

        const providedHash = hashOtp(providedOtp);
        if (providedHash !== otpDoc.otpHash) {
            otpDoc.attempts += 1;
            await otpDoc.save();

            const remaining = Math.max(MAX_ATTEMPTS - otpDoc.attempts, 0);
            console.log(`[OTP] Invalid OTP for ${normalizedEmail}. Attempts: ${otpDoc.attempts}/${MAX_ATTEMPTS}`);

            return res.status(400).json({
                success: false,
                error: `Wrong OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
                errorCode: 'WRONG_OTP',
                attemptsRemaining: remaining,
            });
        }

        otpDoc.isVerified = true;
        otpDoc.verifiedAt = new Date();
        otpDoc.otpHash = hashOtp(crypto.randomBytes(16).toString('hex'));
        otpDoc.expiresAt = new Date();
        await otpDoc.save();

        console.log(`[OTP] OTP verified for ${normalizedEmail}.`);

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully.',
            email: normalizedEmail,
            verified: true,
        });
    } catch (error) {
        console.error('[OTP] verifyOTP failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Server error. Please try again.',
        });
    }
};
