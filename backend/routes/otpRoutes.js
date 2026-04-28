/**
 * ========================================
 * THOZHI - OTP Routes
 * ========================================
 */

const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');

// POST /api/send-otp
router.post('/send-otp', otpController.sendOTP);

// POST /api/verify-otp
router.post('/verify-otp', otpController.verifyOTP);

module.exports = router;
