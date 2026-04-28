/**
 * ========================================
 * THOZHI - Email OTP API Client
 * ========================================
 * Communicates with the Thozhi OTP Backend
 * 
 * For development: Use your local IP (not localhost)
 * For production: Use your deployed server URL
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ===== CONFIG =====
const EXPO_PUBLIC_API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();

function inferExpoHostBaseUrl() {
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants?.manifest?.debuggerHost ||
        Constants?.manifest2?.extra?.expoGo?.debuggerHost;

    if (!hostUri) return '';

    const host = hostUri.split(':')[0];
    if (!host) return '';

    return `http://${host}:3001/api`;
}

function resolveApiBaseUrl() {
    if (EXPO_PUBLIC_API_BASE_URL) {
        return EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, '');
    }

    const expoInferred = inferExpoHostBaseUrl();
    if (expoInferred) {
        return expoInferred;
    }

    if (__DEV__ && Platform.OS === 'android') {
        return 'http://10.0.2.2:3001/api';
    }

    return 'http://localhost:3001/api';
}

const API_BASE_URL = resolveApiBaseUrl();
console.log('[EmailOTP] API base URL:', API_BASE_URL);

// ===== EMAIL OTP API =====
export const EmailOTPApi = {

    /**
     * Send OTP to email
     * @param {string} email
     * @returns {Object} { success, message, error }
     */
    sendOTP: async (email) => {
        console.log('[EmailOTP] Sending OTP request for:', email);

        try {
            const response = await fetch(`${API_BASE_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            console.log('[EmailOTP] API success /send-otp:', data);

            if (response.ok && data.success) {
                return {
                    success: true,
                    message: data.message || 'OTP sent to your email.',
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Failed to send OTP.',
                    retryAfter: data.retryAfter,
                };
            }
        } catch (error) {
            console.error('[EmailOTP] Network error /send-otp:', error.message);
            return {
                success: false,
                error: `Cannot connect to server at ${API_BASE_URL}. Use your PC IP (not localhost) for real device testing.`,
            };
        }
    },

    /**
     * Verify OTP code
     * @param {string} email
     * @param {string} otp
     * @returns {Object} { success, verified, error, attemptsRemaining }
     */
    verifyOTP: async (email, otp) => {
        console.log('[EmailOTP] Verifying OTP for:', email);

        try {
            const response = await fetch(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            console.log('[EmailOTP] API success /verify-otp:', data);

            if (response.ok && data.success) {
                return {
                    success: true,
                    verified: true,
                    email: data.email,
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'Verification failed.',
                    errorCode: data.errorCode,
                    attemptsRemaining: data.attemptsRemaining,
                };
            }
        } catch (error) {
            console.error('[EmailOTP] Network error /verify-otp:', error.message);
            return {
                success: false,
                error: `Cannot connect to server at ${API_BASE_URL}.`,
            };
        }
    },

    /**
     * Health check
     */
    healthCheck: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            const data = await response.json();
            return data.status === 'ok';
        } catch {
            return false;
        }
    },
};
