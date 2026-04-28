import 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
enableScreens(true);
import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { PhoneAuthService } from './services/phoneAuthService';

GoogleSignin.configure({
  webClientId: '564825204982-536e5h9ttblgtds3i523cb93kij3v1c2.apps.googleusercontent.com',
  offlineAccess: true,
});

import SplashFlowScreen from './screens/SplashFlowScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import LoginScreen from './screens/LoginScreen';
import OtpVerificationScreen from './screens/OtpVerificationScreen';
import SafetyIdScreen from './screens/SafetyIDScreen';
import HomeScreen from './screens/HomeScreen';
import FamilyScreen from './screens/FamilyScreen';
import FamilyDashboardScreen from './screens/FamilyDashboardScreen';
import FamilyTrackingScreen from './screens/FamilyTrackingScreen';
import ParentConnectionScreen from './screens/ParentConnectionScreen';
import RouteSetupScreen from './screens/RouteSetupScreen';
import ParentDashboardScreen from './screens/ParentDashboardScreen';
import TravelPlanningScreen from './screens/TravelPlanningScreen';


import LoginMethodScreen from './screens/LoginMethodScreen';
import GirlLoginScreen from './screens/GirlLoginScreen';
import GirlSignupScreen from './screens/GirlSignupScreen';
import PhoneOTPScreen from './screens/PhoneOTPScreen';
import FamilyLoginScreen from './screens/FamilyLoginScreen';
import FamilySignupScreen from './screens/FamilySignupScreen';
import PoliceLoginScreen from './screens/PoliceLoginScreen';
import PoliceHomeScreen from './screens/PoliceHomeScreen';
import PermissionsScreen from './screens/PermissionsScreen';
import LoginSuccessScreen from './screens/LoginSuccessScreen';
import FindPoliceScreen from './screens/FindPoliceScreen';
import ReportScreen from './screens/ReportScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';
import VerificationScreen from './screens/VerificationScreen';
import TestMapScreen from './screens/TestMapScreen';
import WebMapScreen from './screens/WebMapScreen';
import GoogleAPITestScreen from './screens/GoogleAPITestScreen';

const Stack = createNativeStackNavigator();

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0F172A', // Deep dark theme background
  },
};

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  console.log("🚀 THOZHI APP LOADING - VERSION 5.0 (3-Layer Auth)");

  // Auto-login: Check if user is already authenticated
  useEffect(() => {
    let isMounted = true;

    const checkInitialAuth = async () => {
      try {
        console.log('[App] 🔍 Checking local session...');
        // 1. Check local storage first (instantly available)
        const storedData = await PhoneAuthService.getStoredUserData();
        
        if (storedData && storedData.role && isMounted) {
          console.log('[App] 📦 Local session found for role:', storedData.role);
          if (storedData.role === 'family') {
            setInitialRoute('FamilyDashboard');
          } else if (storedData.role === 'police') {
            setInitialRoute('PoliceHome');
          } else {
            setInitialRoute('Home');
          }
          setIsCheckingAuth(false);
          return;
        }

        // 2. If no local data, fallback to Splash
        if (isMounted) {
          console.log('[App] ❌ No local session, showing splash');
          setInitialRoute('Splash');
          setIsCheckingAuth(false);
        }
      } catch (error) {
        console.error('[App] Initial auth error:', error);
        if (isMounted) {
          setInitialRoute('Splash');
          setIsCheckingAuth(false);
        }
      }
    };

    checkInitialAuth();

    // 3. Attach background listener (only if auth is available)
    const unsubscribe = PhoneAuthService.onAuthStateChange((user) => {
      if (user) {
        console.log('[App] 👂 Background Auth: LOGGED IN', user.uid);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Show loading while checking auth
  if (isCheckingAuth || !initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#7B61FF" />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <NavigationContainer theme={AppTheme}>
        <StatusBar style="light" />
        <Stack.Navigator 
          initialRouteName={initialRoute} 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade', // Smooth transitions
            contentStyle: { backgroundColor: '#0F172A' }
          }}
        >
          {/* Utility Screens */}
          <Stack.Screen name="GoogleAPITest" component={GoogleAPITestScreen} />
          <Stack.Screen name="TestMap" component={TestMapScreen} />
          <Stack.Screen name="WebMap" component={WebMapScreen} />

          {/* Onboarding Flow */}
          <Stack.Screen name="Splash" component={SplashFlowScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

          {/* 3-Layer Auth Flow */}
          <Stack.Screen name="LoginMethod" component={LoginMethodScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />


          <Stack.Screen name="GirlLogin" component={GirlLoginScreen} />
          <Stack.Screen name="GirlSignup" component={GirlSignupScreen} />
          <Stack.Screen name="PhoneOTP" component={PhoneOTPScreen} />
          <Stack.Screen name="FamilyLogin" component={FamilyLoginScreen} />
          <Stack.Screen name="FamilySignup" component={FamilySignupScreen} />
          <Stack.Screen name="PoliceLogin" component={PoliceLoginScreen} />

          <Stack.Screen name="Permissions" component={PermissionsScreen} />
          <Stack.Screen name="LoginSuccess" component={LoginSuccessScreen} />

          <Stack.Screen name="SafetyId" component={SafetyIdScreen} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ detachPreviousScreen: false }} />
          <Stack.Screen name="PoliceHome" component={PoliceHomeScreen} options={{ detachPreviousScreen: false }} />
          <Stack.Screen name="Family" component={FamilyScreen} options={{ detachPreviousScreen: false }} />
          <Stack.Screen name="FamilyDashboard" component={FamilyDashboardScreen} options={{ detachPreviousScreen: false }} />
        <Stack.Screen name="FamilyTracking" component={FamilyTrackingScreen} />
        <Stack.Screen name="ParentConnection" component={ParentConnectionScreen} />
        <Stack.Screen name="RouteSetup" component={RouteSetupScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="TravelPlanning" component={TravelPlanningScreen} />
        <Stack.Screen name="FindPolice" component={FindPoliceScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}
