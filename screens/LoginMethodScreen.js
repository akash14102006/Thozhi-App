/**
 * ========================================
 * THOZHI - Login Method Selection Screen
 * ========================================
 * 3-layer auth selection:
 * 1. Google Login (Primary - instant)
 * 2. Email OTP (Backup - free)
 * 3. Phone OTP (Optional - Firebase)
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Platform,
    Alert,
    Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthService } from '../services/authService';

const { width } = Dimensions.get('window');

export default function LoginMethodScreen({ navigation, route }) {
    const { role } = route.params || { role: 'girl' };
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMethod, setLoadingMethod] = useState(null);

    const getRoleConfig = () => {
        switch (role) {
            case 'girl':
                return {
                    title: 'Welcome, Warrior',
                    subtitle: 'Choose how you want to login',
                    icon: 'shield-checkmark',
                    color: '#EC4899',
                    homeScreen: 'Home',
                    signupScreen: 'GirlSignup',
                };
            case 'family':
                return {
                    title: 'Family Squad',
                    subtitle: 'Login to protect your loved ones',
                    icon: 'people',
                    color: '#A78BFA',
                    homeScreen: 'FamilyDashboard',
                    signupScreen: 'FamilySignup',
                };
            case 'police':
                return {
                    title: 'Police Akka',
                    subtitle: 'Verified officers only',
                    icon: 'shield',
                    color: '#60A5FA',
                    homeScreen: 'PoliceHome',
                    signupScreen: 'PoliceLogin',
                };
            default:
                return {
                    title: 'Welcome',
                    subtitle: 'Login to continue',
                    icon: 'person',
                    color: '#7B61FF',
                    homeScreen: 'Home',
                    signupScreen: 'GirlSignup',
                };
        }
    };

    const config = getRoleConfig();

    // ===== GOOGLE LOGIN =====
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setLoadingMethod('google');
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const token = userInfo.data?.idToken || userInfo.idToken;
            console.log('[LoginMethod] 🔑 Google ID Token:', token ? 'YES' : 'NO');

            const result = await AuthService.googleLoginWithCredential(token, role);

            if (result.success) {
                console.log('[LoginMethod] ✅ Google login success, isNewUser:', result.isNewUser);
                if (result.isNewUser) {
                    navigation.replace(config.signupScreen, { userData: result.userData });
                } else {
                    navigation.replace(config.homeScreen);
                }
            }
        } catch (error) {
            console.error('[LoginMethod] ❌ Google error:', error);
            if (error.code !== '-5' && error.code !== 'SIGN_IN_CANCELLED') {
                Alert.alert('Login Failed', 'Google login failed. Please try another method.');
            }
        } finally {
            setIsLoading(false);
            setLoadingMethod(null);
        }
    };

    // ===== EMAIL OTP =====
    const handleEmailLogin = () => {
        navigation.navigate('Login', { role });
    };

    // ===== PHONE OTP =====
    const handlePhoneLogin = () => {
        if (role === 'girl') {
            navigation.navigate('GirlLogin', { role });
        } else if (role === 'family') {
            navigation.navigate('FamilyLogin', { role });
        } else {
            navigation.navigate('PoliceLogin', { role });
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#12002B', '#2A0A4E', '#4B1C7A']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.circle, { top: -100, right: -50, backgroundColor: config.color, opacity: 0.12 }]} />
            <View style={[styles.circle, { bottom: -80, left: -100, backgroundColor: '#9A84FF', opacity: 0.08 }]} />

            {/* Back Button */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={styles.backButton}
            >
                <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
                    <Ionicons name="arrow-back" size={22} color="#FFF" />
                </BlurView>
            </TouchableOpacity>

            <View style={styles.content}>

                {/* Header */}
                <View style={styles.headerSection}>
                    <View style={[styles.roleIconContainer, { backgroundColor: `${config.color}25` }]}>
                        <Ionicons name={config.icon} size={44} color={config.color} />
                    </View>
                    <Text style={styles.title}>{config.title}</Text>
                    <Text style={styles.subtitle}>{config.subtitle}</Text>
                </View>

                {/* Login Methods */}
                <View style={styles.methodsContainer}>

                    {/* 1. GOOGLE (Primary) */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleGoogleLogin}
                        disabled={isLoading}
                        style={styles.methodCardContainer}
                    >
                        <LinearGradient
                            colors={['#7B61FF', '#9A84FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.methodCardPrimary}
                        >
                            <View style={styles.methodIconBg}>
                                {loadingMethod === 'google' ? (
                                    <ActivityIndicator color="#FFF" size="small" />
                                ) : (
                                    <Ionicons name="logo-google" size={26} color="#FFF" />
                                )}
                            </View>
                            <View style={styles.methodTextSection}>
                                <Text style={styles.methodTitle}>Continue with Google</Text>
                                <Text style={styles.methodSubtitle}>Instant • Recommended</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.6)" />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* 2. EMAIL OTP */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleEmailLogin}
                        disabled={isLoading}
                        style={styles.methodCardContainer}
                    >
                        <BlurView intensity={15} tint="dark" style={styles.methodCard}>
                            <View style={styles.methodContent}>
                                <View style={[styles.methodIconBgSecondary, { backgroundColor: 'rgba(167, 139, 250, 0.15)' }]}>
                                    <Ionicons name="mail" size={24} color="#A78BFA" />
                                </View>
                                <View style={styles.methodTextSection}>
                                    <Text style={styles.methodTitle}>Email OTP</Text>
                                    <Text style={styles.methodSubtitle}>Free • No phone needed</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </View>
                        </BlurView>
                    </TouchableOpacity>

                    {/* 3. PHONE OTP */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handlePhoneLogin}
                        disabled={isLoading}
                        style={styles.methodCardContainer}
                    >
                        <BlurView intensity={15} tint="dark" style={styles.methodCard}>
                            <View style={styles.methodContent}>
                                <View style={[styles.methodIconBgSecondary, { backgroundColor: 'rgba(96, 165, 250, 0.15)' }]}>
                                    <Ionicons name="call" size={24} color="#60A5FA" />
                                </View>
                                <View style={styles.methodTextSection}>
                                    <Text style={styles.methodTitle}>Phone OTP</Text>
                                    <Text style={styles.methodSubtitle}>SMS verification</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.4)" />
                            </View>
                        </BlurView>
                    </TouchableOpacity>

                </View>

                {/* Footer */}
                <Text style={styles.footerText}>
                    Your data is encrypted and secure 🔒
                </Text>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#12002B',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    circle: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 50 : 60,
        left: 20,
        zIndex: 100,
    },
    backButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    roleIconContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
    },
    methodsContainer: {
        gap: 12,
    },
    methodCardContainer: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    methodCardPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 20,
    },
    methodCard: {
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    methodContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
    },
    methodIconBg: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    methodIconBgSecondary: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    methodTextSection: {
        flex: 1,
    },
    methodTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 3,
    },
    methodSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        paddingHorizontal: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerText: {
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 30,
    },
});
