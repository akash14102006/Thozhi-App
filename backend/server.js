/**
 * ========================================
 * THOZHI - Email OTP Backend Server
 * ========================================
 * Production-level Express server
 * 
 * Endpoints:
 *   POST /api/send-otp     → Send 6-digit OTP to email
 *   POST /api/verify-otp   → Verify OTP code
 *   GET  /api/health       → Health check
 * 
 * Security:
 *   - OTP expires in 5 minutes
 *   - Max 3 verification attempts
 *   - Rate limit: 1 OTP per 60 seconds per email
 *   - OTP stored server-side only (never sent to frontend)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const otpRoutes = require('./routes/otpRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

async function connectDatabase() {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGO_URI is not set in backend/.env');
    }

    await mongoose.connect(mongoUri, {
        autoIndex: true,
    });
    console.log('[DB] Connected to MongoDB');
}

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ===== ROUTES =====
app.use('/api', otpRoutes);
app.use('/', otpRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'Thozhi OTP Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error('[Server Error]', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
});

// ===== START =====
async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log('');
            console.log('==========================================');
            console.log('  THOZHI OTP SERVER RUNNING');
            console.log(`  Local:  http://localhost:${PORT}`);
            console.log(`  LAN:    http://<YOUR_LOCAL_IP>:${PORT}`);
            console.log('  POST /api/send-otp');
            console.log('  POST /api/verify-otp');
            console.log('  GET  /api/health');
            console.log('==========================================');
            console.log('');
        });
    } catch (error) {
        console.error('[Startup] Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
