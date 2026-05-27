/**
 * ========================================
 * THOZHI - Firebase Configuration (Ultra-Safe)
 * ========================================
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with extreme caution
let auth = null;

try {
    // We try to load auth only when needed or in a safe block
    const { initializeAuth, getReactNativePersistence, getAuth } = require('firebase/auth/react-native');
    
    if (global._firebaseAuth) {
        auth = global._firebaseAuth;
    } else {
        try {
            auth = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage)
            });
            global._firebaseAuth = auth;
            console.log('[Firebase] ✅ Auth Ready');
        } catch (e) {
            auth = getAuth(app);
            global._firebaseAuth = auth;
            console.log('[Firebase] ✅ Auth Linked');
        }
    }
} catch (error) {
    console.log('[Firebase] ⚠️ Auth module not loaded. Phone login may not work, but Email/Google will.');
    auth = { 
        currentUser: null,
        onAuthStateChanged: (cb) => {
            // Dummy implementation to prevent crashes
            setTimeout(() => cb(null), 100);
            return () => {};
        }
    };
}

export { auth };
export default app;
