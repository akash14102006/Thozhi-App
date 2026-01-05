import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler';

import SplashScreen from './screens/SplashScreen';
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

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />


        <Stack.Screen name="Login" component={LoginScreen} />
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
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PoliceHome" component={PoliceHomeScreen} />
        <Stack.Screen name="Family" component={FamilyScreen} />
        <Stack.Screen name="FamilyDashboard" component={FamilyDashboardScreen} />
        <Stack.Screen name="FamilyTracking" component={FamilyTrackingScreen} />
        <Stack.Screen name="ParentConnection" component={ParentConnectionScreen} />
        <Stack.Screen name="RouteSetup" component={RouteSetupScreen} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
        <Stack.Screen name="FindPolice" component={FindPoliceScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
