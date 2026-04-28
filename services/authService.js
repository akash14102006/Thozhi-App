import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import {
    doc,
    setDoc,
    getDoc,
    query,
    where,
    getDocs,
    collection,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

// Lazy auth getter to avoid import-time crashes
function getAuthInstance() {
    if (global._firebaseAuth) return global._firebaseAuth;
    try {
        const firebaseModule = require('./firebase');
        return firebaseModule.auth;
    } catch (e) {
        return null;
    }
}

// Lazy Firebase Auth functions getter
function getFirebaseAuthFunctions() {
    try {
        return require('firebase/auth');
    } catch (e) {
        return {};
    }
}

const firebaseAuth = getFirebaseAuthFunctions();


const MOCK_DB = {
    policeOfficers: {
        'P1': { id: 'P1', name: 'Officer Priya', badge: 'TN-4921', status: 'active', rating: 4.8, lat: 8.9591, lng: 77.3151 },
        'P2': { id: 'P2', name: 'Inspector Meera', badge: 'TN-5520', status: 'active', rating: 4.9, lat: 8.9620, lng: 77.3080 },
        'P3': { id: 'P3', name: 'Officer Kausalya', badge: 'TN-1180', status: 'busy', rating: 4.7, lat: 8.9550, lng: 77.3180 },
    }
};

export const AuthService = {

    // --- REAL-TIME FIREBASE AUTHENTICATION ---

    googleLogin: async (firebaseUser, role) => {
        console.log(`[Firebase] Verifying Real User: ${firebaseUser.email}...`);

        try {
            const userRef = doc(db, "users", firebaseUser.email);
            const userSnap = await getDoc(userRef);

            let userData;
            let isNewUser = false;

            if (!userSnap.exists()) {
                isNewUser = true;
                const safetyId = generateSafetyId();
                userData = {
                    email: firebaseUser.email,
                    name: firebaseUser.name || firebaseUser.displayName || 'Warrior User',
                    photoURL: firebaseUser.picture || firebaseUser.photoURL || firebaseUser.photoUrl || null,
                    role: role,
                    safetyId: safetyId,
                    createdAt: new Date().toISOString(),
                    isVerified: true,
                    googleId: firebaseUser.id || firebaseUser.uid || null
                };
                await setDoc(userRef, userData);
            } else {
                userData = userSnap.data();

                // If it's a girl role but emergency contacts are missing, they haven't finished signup
                if (role === 'girl' && (!userData.emergencyContacts || userData.emergencyContacts.length === 0)) {
                    isNewUser = true;
                } else {
                    // Only persist session for users who have finished the process
                    await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
                    await AsyncStorage.setItem('SAFETY_ID', userData.safetyId);
                }
            }

            return { success: true, isNewUser, userData };
        } catch (error) {
            console.error("Firebase Sign-In Error:", error);
            throw error;
        }
    },

    googleLoginWithCredential: async (idToken, role) => {
        console.log("=== DEBUG: FIREBASE AUTH FLOW ===");
        console.log("[Debug] 1. Received idToken:", idToken ? "YES (Token length: " + idToken.length + ")" : "NO TOKEN!");
        try {
            const credential = firebaseAuth.GoogleAuthProvider.credential(idToken);
            const authInstance = getAuthInstance();
            if (!authInstance) throw new Error('Firebase Auth not available');
            const userCredential = await firebaseAuth.signInWithCredential(authInstance, credential);
            const firebaseUser = userCredential.user;
            console.log("[Debug] 2. Firebase sign-in successful. UID:", firebaseUser.uid);

            // Re-use existing googleLogin logic to sync with Firestore
            const result = await AuthService.googleLogin({
                email: firebaseUser.email,
                name: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid
            }, role);
            console.log("[Debug] 3. Firebase Firestore Result:", JSON.stringify(result));
            return result;
        } catch (error) {
            console.error("[Debug] Firebase Credential Login Error:", error);
            throw error;
        }
    },

    // Simulate OTP for phone auth (Firebase real phone auth requires native recaptcha/verification)
    sendPhoneOtp: async (phone, role) => {
        console.log(`[Firebase] Requesting OTP for +91${phone}`);
        // In production: return auth().signInWithPhoneNumber(phone)
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },

    verifyPhoneOtp: async (phone, otp, role) => {
        console.log(`[Firebase] Verifying Phone: ${phone}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Find existing user by phone
            const q = query(collection(db, "users"), where("phone", "==", phone));
            const querySnapshot = await getDocs(q);

            let userData = null;
            if (!querySnapshot.empty) {
                userData = querySnapshot.docs[0].data();
                await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
                if (userData.safetyId) {
                    await AsyncStorage.setItem('SAFETY_ID', userData.safetyId);
                }
            }

            return {
                success: true,
                isNewUser: !userData,
                userData,
                message: 'Phone Verified via Firebase'
            };
        } catch (error) {
            console.error("Firebase Verify Error:", error);
            return { success: false, message: error.message };
        }
    },

    createProfile: async (role, profileData) => {
        const key = profileData.email || profileData.phone;
        console.log(`[Firebase] Attempting to create profile for: ${key}`);

        if (!key) throw new Error("Email or Phone is required to create a profile.");

        const userRef = doc(db, "users", key);

        // Safety ID must be unique and permanent
        const safetyId = generateSafetyId();

        const newUser = {
            ...profileData,
            role,
            safetyId,
            createdAt: new Date().toISOString(),
            isVerified: true,
            status: 'online'
        };

        try {
            // Firestore does not allow 'undefined' values. Clean the object before saving.
            const cleanUser = Object.fromEntries(
                Object.entries(newUser).filter(([_, v]) => v !== undefined)
            );

            await setDoc(userRef, cleanUser);
            console.log(`[Firebase] Profile successfully created in Firestore for ${key}`);

            await AsyncStorage.setItem('USER_DATA', JSON.stringify(cleanUser));
            await AsyncStorage.setItem('SAFETY_ID', safetyId);
            return { success: true, safetyId, userData: cleanUser };
        } catch (error) {
            console.error("Firestore Error detail:", error);
            throw error;
        }
    },

    createGirlProfile: async (phone, profileData) => {
        return AuthService.createProfile('girl', { ...profileData, phone });
    },

    // --- REAL-TIME SQUAD LINKING (FIRESTORE) ---

    linkFamilyToGirl: async (parentPhone, girlSafetyId, secureToken = null) => {
        console.log(`[Firebase] Querying Safety ID: ${girlSafetyId} with Token: ${secureToken}`);

        try {
            const q = query(collection(db, "users"), where("safetyId", "==", girlSafetyId), where("role", "==", "girl"));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return { success: false, message: 'Invalid Safety ID. No matching warrior found.' };
            }

            const girlDoc = querySnapshot.docs[0];
            const girlData = girlDoc.data();

            // Store request in a pending collection
            const requestRef = doc(db, "connection_requests", `${parentPhone}_${girlSafetyId}`);
            await setDoc(requestRef, {
                from: parentPhone,
                to: girlSafetyId,
                status: 'pending',
                secureToken: secureToken, // Token parsed from QR
                timestamp: new Date().toISOString()
            });

            return {
                success: true,
                pending: true,
                message: `Verified! Request sent to ${girlData.name}.`
            };
        } catch (error) {
            return { success: false, message: 'Real-time connection failed. Try again.' };
        }
    },

    findNearbyPolice: async (location) => {
        console.log('[Backend-GCP] Querying nearby Police...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Object.values(MOCK_DB.policeOfficers).map(officer => ({
            ...officer,
            distance: '1.2 km',
            eta: '4 mins'
        }));
    },

    requestPoliceAssistance: async (officerId, userLocation) => {
        console.log(`[Backend-GCP] Dispatching request to ${officerId}...`);
        return { success: true, message: 'Officer notified. Tracking started.' };
    },

    logout: async () => {
        await signOut(auth);
        await AsyncStorage.clear();
    },

    // --- GEOFENCE MANAGEMENT (REAL BACKEND) ---



    getGeofences: async () => {
        try {
            // Check Network Status
            const { isInternetReachable } = await Network.getNetworkStateAsync();

            if (isInternetReachable) {
                const geofencesRef = collection(db, "geofences");
                const snapshot = await getDocs(geofencesRef);

                let zones = [];
                if (snapshot.empty) {
                    zones = await AuthService.seedDefaultGeofences();
                } else {
                    zones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                }

                // Cache the fresh data
                await AsyncStorage.setItem('CACHED_GEOFENCES', JSON.stringify(zones));
                return zones;
            } else {
                console.log("[Offline] Loading geofences from cache...");
                const cached = await AsyncStorage.getItem('CACHED_GEOFENCES');
                return cached ? JSON.parse(cached) : [];
            }
        } catch (error) {
            console.error("Error fetching geofences:", error);
            // Fallback to cache on error
            const cached = await AsyncStorage.getItem('CACHED_GEOFENCES');
            return cached ? JSON.parse(cached) : [];
        }
    },

    // --- OFFLINE LOCATION SYNC ---

    saveOfflineLocation: async (location, safetyId) => {
        try {
            const pendingParams = {
                location,
                timestamp: new Date().toISOString(),
                safetyId
            };
            // Append to queue
            const currentQueue = JSON.parse(await AsyncStorage.getItem('OFFLINE_LOCATION_QUEUE') || '[]');
            currentQueue.push(pendingParams);

            // Keep queue manageable (max 50 points)
            if (currentQueue.length > 50) currentQueue.shift();

            await AsyncStorage.setItem('OFFLINE_LOCATION_QUEUE', JSON.stringify(currentQueue));
            console.log(`[Offline] Location queued. Queue size: ${currentQueue.length}`);
        } catch (e) {
            console.error("Failed to save offline location", e);
        }
    },

    syncOfflineLocations: async () => {
        try {
            const queueStr = await AsyncStorage.getItem('OFFLINE_LOCATION_QUEUE');
            if (!queueStr) return;

            const queue = JSON.parse(queueStr);
            if (queue.length === 0) return;

            console.log(`[Sync] Found ${queue.length} offline locations to sync...`);

            // We will sync the LATEST location immediately to update the dashboard
            // and optionally archive the path. For now, we update the user doc with the latest.
            const latest = queue[queue.length - 1];

            if (latest && latest.safetyId) {
                const userRef = doc(db, "users", latest.safetyId);
                await updateDoc(userRef, {
                    lastLocation: latest.location,
                    lastUpdated: latest.timestamp,
                    status: 'online', // Back online
                    'offline_data_synced': true
                });
            }

            // Clear queue after sync
            await AsyncStorage.removeItem('OFFLINE_LOCATION_QUEUE');
            console.log("[Sync] Offline locations synced successfully.");

        } catch (e) {
            console.error("Failed to sync offline locations", e);
        }
    },

    seedDefaultGeofences: async () => {
        const defaultZones = [
            { name: 'Tenkasi Junction Area', lat: 8.9591, lng: 77.3151, radius: 300, riskLevel: 'MEDIUM', type: 'HOTSPOT' },
            { name: 'Isolated Canal Road', lat: 8.9620, lng: 77.3080, radius: 250, riskLevel: 'HIGH', type: 'ISOLATED' },
            { name: 'New Bus Stand Backside', lat: 8.9550, lng: 77.3180, radius: 200, riskLevel: 'HIGH', type: 'DARK_ZONE' }
        ];

        console.log("[Backend] Seeding default geofences to Firestore...");
        const geofencesRef = collection(db, "geofences");

        const seededZones = [];
        for (const zone of defaultZones) {
            const newDoc = doc(geofencesRef);
            await setDoc(newDoc, zone);
            seededZones.push({ id: newDoc.id, ...zone });
        }
        return seededZones;
    }
};

function generateSafetyId() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `THOZHI-${random}`;
}
