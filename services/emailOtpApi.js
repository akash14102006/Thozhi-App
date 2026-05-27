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

function isUrlInvalid(url) {
    if (!url) return true;
    const lower = url.toLowerCase();
    return lower.includes('localhost') || lower.includes('127.0.0.1') || lower.includes('exp.direct');
}

function inferExpoHostBaseUrl() {
    const hostUri =
        Constants.expoConfig?.hostUri ||
        Constants?.manifest?.debuggerHost ||
        Constants?.manifest2?.extra?.expoGo?.debuggerHost;

    if (!hostUri) return '';

    const host = hostUri.split(':')[0];
    if (!host) return '';

    const url = `http://${host}:3001/api`;
    if (isUrlInvalid(url)) return '';

    return url;
}

function resolveApiBaseUrl() {
    // 1. Prioritize environment variable if valid
    if (EXPO_PUBLIC_API_BASE_URL && !isUrlInvalid(EXPO_PUBLIC_API_BASE_URL)) {
        return EXPO_PUBLIC_API_BASE_URL.replace(/\/$/, '');
    }

    // 2. Inferred host from Expo Go if valid
    const expoInferred = inferExpoHostBaseUrl();
    if (expoInferred) {
        return expoInferred;
    }

    // 3. Absolute fallback to the development backend IP (instead of localhost)
    return 'http://192.168.29.240:3001/api';
}

const API_BASE_URL = resolveApiBaseUrl();
// MANDATORY LOG FOR DEBUGGING
console.log("API URL:", API_BASE_URL);

// ===== HELPER: FETCH WITH TIMEOUT =====
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

// ===== EMAIL OTP API =====
export const EmailOTPApi = {

    /**
     * Send OTP to email
     * @param {string} email
     * @returns {Object} { success, message, error }
     */
    sendOTP: async (email) => {
        console.log('[EmailOTP] Sending OTP request for:', email);
        console.log("API URL:", API_BASE_URL);

        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            }, 10000);

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                console.error('[EmailOTP] Invalid JSON response:', jsonErr);
                return {
                    success: false,
                    error: 'Invalid response format from server. Please check backend logs.',
                };
            }

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
            console.error('[EmailOTP] Error /send-otp:', error);
            
            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: `Connection timeout: Server at ${API_BASE_URL} took too long to respond. Ensure your backend is running.`,
                };
            }

            return {
                success: false,
                error: `Network request failed. Backend server at ${API_BASE_URL} is unreachable. Ensure your device is connected to the same network as your PC.`,
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
        console.log("API URL:", API_BASE_URL);

        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            }, 10000);

            let data;
            try {
                data = await response.json();
            } catch (jsonErr) {
                console.error('[EmailOTP] Invalid JSON response:', jsonErr);
                return {
                    success: false,
                    error: 'Invalid response format from server. Please check backend logs.',
                };
            }

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
            console.error('[EmailOTP] Error /verify-otp:', error);

            if (error.name === 'AbortError') {
                return {
                    success: false,
                    error: `Connection timeout: Server at ${API_BASE_URL} took too long to respond.`,
                };
            }

            return {
                success: false,
                error: `Network request failed. Backend server at ${API_BASE_URL} is unreachable.`,
            };
        }
    },

    /**
     * Health check
     */
    healthCheck: async () => {
        try {
            const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {}, 5000);
            const data = await response.json();
            return data.status === 'ok';
        } catch {
            return false;
        }
    },
};
