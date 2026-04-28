/**
 * ========================================
 * THOZHI - Production Phone Auth Service
 * ========================================
 * Uses Firebase v9+ modular SDK
 * Handles: OTP send, verify, auto-verify, error mapping
 * Safe against null auth (graceful degradation)
 */

import { doc, setDoc, getDoc, query, where, getDocs, collection } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';

// ===== Get auth lazily to avoid import-time crashes =====
function getAuth() {
    // Try global cache first
    if (global._firebaseAuth) return global._firebaseAuth;

    // Try importing from firebase.js
    try {
        const firebaseModule = require('./firebase');
        if (firebaseModule.auth) return firebaseModule.auth;
    } catch (e) {
        console.warn('[PhoneAuth] Could not get auth from firebase.js');
    }

    return null;
}

// ===== Get Firebase Auth functions lazily =====
function getAuthFunctions() {
    try {
        return require('firebase/auth');
    } catch (e) {
        console.warn('[PhoneAuth] Could not load firebase/auth');
        return null;
    }
}

// ===== ERROR MAP (User-friendly messages) =====
const ERROR_MAP = {
    'auth/invalid-phone-number': 'Invalid phone number. Please check and try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'auth/invalid-verification-code': 'Wrong OTP. Please check and try again.',
    'auth/code-expired': 'OTP expired. Please request a new one.',
    'auth/session-expired': 'Session expired. Please request a new OTP.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/missing-phone-number': 'Phone number is required.',
    'auth/captcha-check-failed': 'Verification failed. Please try again.',
    'auth/user-disabled': 'This account has been disabled.',
};

function getErrorMessage(error) {
    const code = error?.code || '';
    return ERROR_MAP[code] || error?.message || 'Something went wrong. Please try again.';
}

function generateSafetyId() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `THOZHI-${random}`;
}

// ===== PHONE AUTH SERVICE =====
export const PhoneAuthService = {

    /**
     * STEP 1: Send OTP to phone number
     */
    sendOTP: async (phoneNumber) => {
        console.log('[PhoneAuth] 📱 Sending OTP to:', phoneNumber);

        try {
            if (!phoneNumber || !phoneNumber.startsWith('+')) {
                throw { code: 'auth/invalid-phone-number' };
            }

            const authInstance = getAuth();
            const firebaseAuth = getAuthFunctions();

            if (!authInstance || !firebaseAuth) {
                throw { code: 'auth/unavailable', message: 'Firebase Auth is not available. Please restart the app.' };
            }

            const confirmationResult = await firebaseAuth.signInWithPhoneNumber(authInstance, phoneNumber);

            console.log('[PhoneAuth] ✅ OTP sent successfully');
            return {
                success: true,
                confirmationResult,
            };
        } catch (error) {
            console.error('[PhoneAuth] ❌ Send OTP Error:', error.code, error.message);
            return {
                success: false,
                error: getErrorMessage(error),
                errorCode: error.code,
            };
        }
    },

    /**
     * STEP 2: Verify OTP code
     */
    verifyOTP: async (confirmationResult, otpCode, role) => {
        console.log('[PhoneAuth] 🔐 Verifying OTP...');

        try {
            if (!confirmationResult) {
                throw { code: 'auth/session-expired' };
            }

            if (!otpCode || otpCode.length < 4) {
                throw { code: 'auth/invalid-verification-code' };
            }

            const userCredential = await confirmationResult.confirm(otpCode);
            const firebaseUser = userCredential.user;

            console.log('[PhoneAuth] ✅ OTP verified! Firebase UID:', firebaseUser.uid);

            const result = await PhoneAuthService.syncUserToFirestore(firebaseUser, role);

            return {
                success: true,
                user: firebaseUser,
                ...result,
            };
        } catch (error) {
            console.error('[PhoneAuth] ❌ Verify OTP Error:', error.code, error.message);
            return {
                success: false,
                error: getErrorMessage(error),
                errorCode: error.code,
            };
        }
    },

    /**
     * STEP 3: Sync authenticated user to Firestore
     */
    syncUserToFirestore: async (firebaseUser, role) => {
        console.log('[PhoneAuth] 🔄 Syncing user to Firestore...');

        try {
            const phone = firebaseUser.phoneNumber;
            const uid = firebaseUser.uid;

            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            let userData;
            let isNewUser = false;

            if (!userSnap.exists()) {
                const q = query(collection(db, 'users'), where('phone', '==', phone));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    userData = querySnapshot.docs[0].data();
                    userData.uid = uid;
                    await setDoc(userRef, userData, { merge: true });
                    console.log('[PhoneAuth] 📦 Migrated legacy user');
                } else {
                    isNewUser = true;
                    const safetyId = generateSafetyId();
                    userData = {
                        phone: phone,
                        uid: uid,
                        role: role,
                        safetyId: safetyId,
                        createdAt: new Date().toISOString(),
                        isVerified: true,
                        authMethod: 'phone',
                        status: 'online',
                    };
                    await setDoc(userRef, userData);
                    console.log('[PhoneAuth] 🆕 New user profile created');
                }
            } else {
                userData = userSnap.data();
                if (role === 'girl' && (!userData.emergencyContacts || userData.emergencyContacts.length === 0)) {
                    isNewUser = true;
                }
                console.log('[PhoneAuth] 📋 Existing user loaded');
            }

            if (!isNewUser) {
                await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
                if (userData.safetyId) {
                    await AsyncStorage.setItem('SAFETY_ID', userData.safetyId);
                }
            }

            return { isNewUser, userData };
        } catch (error) {
            console.error('[PhoneAuth] ❌ Firestore sync error:', error);
            throw error;
        }
    },

    /**
     * AUTH STATE LISTENER — safe against null/dummy auth
     */
    onAuthStateChange: (callback) => {
        const authInstance = getAuth();
        
        if (!authInstance || typeof authInstance.onAuthStateChanged !== 'function') {
            console.warn('[PhoneAuth] ⚠️ Auth state listener unavailable');
            setTimeout(() => callback(null), 100);
            return () => {};
        }

        console.log('[PhoneAuth] 👂 Attaching listener...');
        return authInstance.onAuthStateChanged((user) => {
            callback(user);
        });
    },

    /**
     * Check if user is already logged in
     */
    getCurrentUser: () => {
        const authInstance = getAuth();
        return authInstance ? authInstance.currentUser : null;
    },

    /**
     * Get stored user data
     */
    getStoredUserData: async () => {
        try {
            const data = await AsyncStorage.getItem('USER_DATA');
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },
};
