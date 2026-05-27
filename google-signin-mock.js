import { NativeModules } from 'react-native';

const hasNativeModule = NativeModules.RNGoogleSignin;

let GoogleSigninModule;

if (hasNativeModule) {
  try {
    // Load the real module if it exists in the native binary (e.g. custom dev build)
    const RealModule = require('@react-native-google-signin/google-signin');
    GoogleSigninModule = RealModule.GoogleSignin;
  } catch (e) {
    console.warn('[GoogleSignin Mock] Failed to load real module despite native module presence:', e);
  }
}

if (!GoogleSigninModule) {
  // Bypasses the missing native module in Expo Go / Web / Simulators
  GoogleSigninModule = {
    configure: (config) => {
      console.log('[GoogleSignin Mock] Configured with:', config);
    },
    hasPlayServices: async () => {
      return true;
    },
    signIn: async () => {
      console.log('[GoogleSignin Mock] Sign in trigger (Mocking success)');
      return {
        user: {
          id: 'mock-google-id-123',
          name: 'Thozhi User',
          email: 'thozhi.user@example.com',
          photo: 'https://via.placeholder.com/150',
        },
        idToken: 'mock-id-token-xyz',
      };
    },
    signOut: async () => {
      console.log('[GoogleSignin Mock] Sign out trigger');
    },
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  };
}

export const GoogleSignin = GoogleSigninModule;
