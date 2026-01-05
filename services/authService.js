import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';


const MOCK_DB = {
    users: {
        'test@example.com': {
            email: 'test@example.com',
            name: 'Test User',
            role: 'girl',
            safetyId: 'SAF-2025-TEST01'
        }
    },
    policeOfficers: {
        'POLICE01': {
            id: 'POLICE01',
            name: 'Officer Priya',
            phone: '9998887776',
            email: 'priya@police.in',
            lat: 37.7895, lng: -122.433,
            status: 'active', 
            rating: 4.8
        },
        'POLICE02': {
            id: 'POLICE02',
            name: 'Officer Anjali',
            phone: '9998887771',
            email: 'anjali@police.in',
            lat: 37.794, lng: -122.439,
            status: 'active',
            rating: 4.9
        }
    }
};


export const AuthService = {

    
    googleLogin: async (googleUser, role) => {
        console.log(`[Backend-GCP] Verifying Google Token for ${googleUser.email} (${role})...`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const email = googleUser.email;
        let userData = MOCK_DB.users[email];
        let isNewUser = false;

        if (!userData) {
            isNewUser = true;
            console.log(`[Backend-GCP] New Google User: ${email}`);
        }

        try {
            await AsyncStorage.setItem('USER_EMAIL', email);
            await AsyncStorage.setItem('USER_ROLE', role);
            if (googleUser.photoUrl) await AsyncStorage.setItem('USER_PHOTO', googleUser.photoUrl);

            if (userData) {
                await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
                if (userData.safetyId) await AsyncStorage.setItem('SAFETY_ID', userData.safetyId);
            }
        } catch (e) {
            console.error('Storage Error', e);
        }

        return { success: true, isNewUser, userData };
    },

    
    sendOtp: async (email) => {
        console.log(`[Backend] Sending OTP to ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },

    verifyOtp: async (email, otp) => {
        console.log(`[Backend] Verifying OTP ${otp} for ${email}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const userData = MOCK_DB.users[email];
        const isNewUser = !userData;
        const safetyId = userData ? userData.safetyId : null;

        return {
            success: true,
            isNewUser,
            safetyId,
            message: 'OTP Verified successfully'
        };
    },

    
    sendPhoneOtp: async (phone, role) => {
        console.log(`[Backend] Sending OTP to +91${phone} for role: ${role}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },

    verifyPhoneOtp: async (phone, otp, role) => {
        console.log(`[Backend] Verifying Phone OTP ${otp} for ${phone} as ${role}`);
        await new Promise(resolve => setTimeout(resolve, 1000));

        
        const isNewUser = phone !== '9999999999';

        return {
            success: true,
            isNewUser,
            message: 'Phone Verified'
        };
    },

    createProfile: async (role, profileData) => {
        console.log(`[Backend-GCP] Creating Profile for ${role}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const safetyId = generateSafetyId(role === 'police' ? 'POL' : 'SAF');
        const newUser = {
            ...profileData,
            role,
            safetyId,
            createdAt: new Date().toISOString(),
            isVerified: true
        };

        const key = profileData.email || profileData.phone;
        MOCK_DB.users[key] = newUser;

        await AsyncStorage.setItem('USER_DATA', JSON.stringify(newUser));
        await AsyncStorage.setItem('SAFETY_ID', safetyId);

        return { success: true, safetyId, userData: newUser };
    },

    
    createGirlProfile: async (phone, profileData) => {
        return AuthService.createProfile('girl', { ...profileData, phone });
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

    linkFamilyArgs: async (parentEmail, safetyId) => {
        return { success: true, message: 'Link request sent to Girl app.' };
    },

    
    linkFamilyToGirl: async (phone, girlSafetyId) => {
        console.log(`[Backend] Linking Family (${phone}) to Girl (${girlSafetyId})`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        
        return {
            success: true,
            pending: true,
            message: 'Connection request sent successfully'
        };
    }
};

function generateSafetyId(prefix = 'SAF') {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${new Date().getFullYear()}-${random}`;
}

