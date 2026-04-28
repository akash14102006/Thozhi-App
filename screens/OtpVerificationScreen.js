/**
 * ========================================
 * THOZHI - Email OTP Verification Screen
 * ========================================
 * Production-level email OTP verification with:
 * - 6-digit code input with individual boxes
 * - Resend with cooldown timer
 * - Attempts tracking
 * - Auto-submit on last digit
 * - Shake on error
 * - Syncs verified user to Firestore
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Animated,
    Platform,
    Alert,
    Keyboard
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { EmailOTPApi } from '../services/emailOtpApi';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function generateSafetyId() {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `THOZHI-${random}`;
}

export default function OtpVerificationScreen({ route, navigation }) {
    const { email: initialEmail, role } = route.params || { email: 'test@example.com', role: 'girl' };

    const [email] = useState(initialEmail);
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [authResult, setAuthResult] = useState(null);

    const inputRefs = useRef([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // ===== ANIMATIONS =====
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
        setTimeout(() => inputRefs.current[0]?.focus(), 400);
    }, []);

    // ===== RESEND TIMER =====
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    useEffect(() => {
        if (!authResult) return;
        handleNavigationAfterAuth(authResult);
    }, [authResult]);

    // ===== SHAKE ERROR =====
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    // ===== SYNC USER TO FIRESTORE AFTER EMAIL VERIFY =====
    const syncEmailUserToFirestore = async (verifiedEmail, userRole) => {
        console.log('[EmailOTP] 🔄 Syncing email user to Firestore...');
        try {
            const userRef = doc(db, 'users', verifiedEmail);
            const userSnap = await getDoc(userRef);

            let userData;
            let isNewUser = false;

            if (!userSnap.exists()) {
                isNewUser = true;
                const safetyId = generateSafetyId();
                userData = {
                    email: verifiedEmail,
                    role: userRole,
                    safetyId,
                    createdAt: new Date().toISOString(),
                    isVerified: true,
                    authMethod: 'email',
                    status: 'online',
                };
                await setDoc(userRef, userData);
                console.log('[EmailOTP] 🆕 New user profile created');
            } else {
                userData = userSnap.data();
                if (userRole === 'girl' && (!userData.emergencyContacts || userData.emergencyContacts.length === 0)) {
                    isNewUser = true;
                }
                console.log('[EmailOTP] 📋 Existing user loaded');
            }

            if (!isNewUser) {
                await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
                if (userData.safetyId) {
                    await AsyncStorage.setItem('SAFETY_ID', userData.safetyId);
                }
            }

            return { isNewUser, userData };
        } catch (error) {
            console.error('[EmailOTP] ❌ Firestore sync error:', error);
            throw error;
        }
    };

    // ===== NAVIGATE AFTER AUTH =====
    const handleNavigationAfterAuth = (result) => {
        if (result.isNewUser) {
            if (role === 'girl') {
                navigation.replace('GirlSignup', { email });
            } else if (role === 'family') {
                navigation.replace('FamilySignup', { email });
            } else {
                navigation.replace('Home');
            }
        } else {
            if (role === 'family') {
                navigation.replace('FamilyDashboard');
            } else if (role === 'police') {
                navigation.replace('PoliceHome');
            } else {
                navigation.replace('Home');
            }
        }
    };

    // ===== VERIFY OTP =====
    const handleVerify = async () => {
        const otpCode = otp.join('');
        setErrorMessage('');

        if (otpCode.length !== OTP_LENGTH) {
            setErrorMessage(`Please enter the complete ${OTP_LENGTH}-digit code`);
            triggerShake();
            return;
        }

        setIsLoading(true);
        Keyboard.dismiss();

        try {
            console.log('[EmailOTP] 🔐 Verifying OTP for:', email);
            const result = await EmailOTPApi.verifyOTP(email, otpCode);

            if (result.success && result.verified) {
                console.log('[EmailOTP] OTP verified');
                console.log('[EmailOTP] ✅ Email verified! Syncing to Firestore...');
                const syncResult = await syncEmailUserToFirestore(email, role);
                setAuthResult(syncResult);
            } else {
                console.log('[EmailOTP] ❌ Verification failed:', result.error);
                setErrorMessage(result.error || 'Wrong OTP. Please try again.');
                triggerShake();
                setOtp(new Array(OTP_LENGTH).fill(''));
                setTimeout(() => inputRefs.current[0]?.focus(), 300);
            }
        } catch (error) {
            console.error('[EmailOTP] Unexpected error:', error);
            setErrorMessage('Something went wrong. Please try again.');
            triggerShake();
        } finally {
            setIsLoading(false);
        }
    };

    // ===== RESEND OTP =====
    const handleResend = async () => {
        if (!canResend || resendLoading) return;
        setResendLoading(true);
        setErrorMessage('');

        try {
            const result = await EmailOTPApi.sendOTP(email);
            if (result.success) {
                setResendTimer(RESEND_COOLDOWN);
                setCanResend(false);
                setOtp(new Array(OTP_LENGTH).fill(''));
                Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
                setTimeout(() => inputRefs.current[0]?.focus(), 300);
            } else {
                setErrorMessage(result.error);
                triggerShake();
            }
        } catch (error) {
            setErrorMessage('Failed to resend OTP.');
        } finally {
            setResendLoading(false);
        }
    };

    // ===== OTP INPUT =====
    const handleOtpChange = (text, index) => {
        if (text && !/^\d+$/.test(text)) return;

        const newOtp = [...otp];

        // Handle paste
        if (text.length > 1) {
            const pasted = text.slice(0, OTP_LENGTH).split('');
            for (let i = 0; i < OTP_LENGTH; i++) {
                newOtp[i] = pasted[i] || '';
            }
            setOtp(newOtp);
            const lastIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
            inputRefs.current[lastIndex]?.focus();
            if (pasted.length >= OTP_LENGTH) {
                setTimeout(() => handleVerify(), 300);
            }
            return;
        }

        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        if (text && index === OTP_LENGTH - 1) {
            const fullCode = newOtp.join('');
            if (fullCode.length === OTP_LENGTH) {
                setTimeout(() => handleVerify(), 200);
            }
        }

        if (errorMessage) setErrorMessage('');
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const maskedEmail = email
        ? email.replace(/(.{2})(.*)(@)/, '$1***$3')
        : '***@***.com';

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#1c0c2e', '#2e1065', '#491c7a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.glowCircle, { top: -100, right: -80, backgroundColor: '#7B61FF' }]} />
            <View style={[styles.glowCircle, { bottom: -120, left: -60, backgroundColor: '#9A84FF' }]} />

            {/* Back */}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={styles.backButton}
            >
                <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
                    <Ionicons name="arrow-back" size={22} color="#FFF" />
                </BlurView>
            </TouchableOpacity>

            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconOrb}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                            style={styles.iconGlass}
                        >
                            <Ionicons name="mail-open" size={42} color="#A78BFA" />
                        </LinearGradient>
                    </View>
                </View>

                <Text style={styles.mainTitle}>Email Verification</Text>
                <Text style={styles.subtitle}>
                    Enter the {OTP_LENGTH}-digit code sent to{'\n'}
                    <Text style={styles.emailHighlight}>{maskedEmail}</Text>
                </Text>

                {/* OTP Inputs */}
                <Animated.View style={[styles.otpSection, { transform: [{ translateX: shakeAnim }] }]}>
                    <View style={styles.otpRow}>
                        {otp.map((digit, index) => (
                            <View key={index} style={[
                                styles.otpInputWrapper,
                                digit ? styles.otpInputActive : null,
                                errorMessage ? styles.otpInputError : null,
                            ]}>
                                <TextInput
                                    ref={(ref) => (inputRefs.current[index] = ref)}
                                    style={styles.otpInput}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    selectTextOnFocus
                                    cursorColor="#A78BFA"
                                    editable={!isLoading}
                                />
                                {digit ? <View style={styles.activeBorder} /> : null}
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Error */}
                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                {/* Verify Button */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleVerify}
                    disabled={isLoading || otp.join('').length !== OTP_LENGTH}
                    style={[
                        styles.verifyButtonContainer,
                        (isLoading || otp.join('').length !== OTP_LENGTH) ? { opacity: 0.6 } : null,
                    ]}
                >
                    <LinearGradient
                        colors={['#7B61FF', '#9A84FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.verifyButton}
                    >
                        {isLoading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator color="#FFF" size="small" />
                                <Text style={[styles.verifyButtonText, { marginLeft: 10 }]}>Verifying...</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Resend */}
                <TouchableOpacity
                    style={styles.resendContainer}
                    onPress={handleResend}
                    disabled={!canResend || resendLoading}
                    activeOpacity={0.7}
                >
                    {resendLoading ? (
                        <ActivityIndicator color="#7B61FF" size="small" />
                    ) : canResend ? (
                        <>
                            <Text style={styles.resendText}>Didn't receive code? </Text>
                            <Text style={styles.resendLink}>Resend OTP</Text>
                        </>
                    ) : (
                        <Text style={styles.resendTimer}>
                            Resend in <Text style={styles.resendTimerBold}>{resendTimer}s</Text>
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Go back link */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 16 }}
                >
                    <Text style={styles.goBackText}>Wrong email? Go Back</Text>
                </TouchableOpacity>

            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a0033',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    glowCircle: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        opacity: 0.15,
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
    iconContainer: {
        marginBottom: 32,
        alignItems: 'center',
    },
    iconOrb: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 30,
        elevation: 20,
    },
    iconGlass: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    emailHighlight: {
        color: '#7B61FF',
        fontWeight: '700',
        fontSize: 15,
    },
    otpSection: {
        width: '100%',
        marginBottom: 20,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    otpInputWrapper: {
        width: (width - 64 - 50) / OTP_LENGTH,
        maxWidth: 52,
        height: 62,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    otpInputActive: {
        borderColor: '#7B61FF',
        backgroundColor: 'rgba(123, 97, 255, 0.1)',
    },
    otpInputError: {
        borderColor: '#FF6B6B',
        backgroundColor: 'rgba(255, 107, 107, 0.08)',
    },
    otpInput: {
        flex: 1,
        color: '#FFF',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    activeBorder: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        width: '60%',
        alignSelf: 'center',
        backgroundColor: '#A78BFA',
        borderRadius: 2,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.2)',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 13,
        marginLeft: 8,
        flex: 1,
    },
    verifyButtonContainer: {
        width: '100%',
        marginBottom: 24,
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 24,
        elevation: 12,
    },
    verifyButton: {
        height: 58,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    verifyButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    resendText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.6)',
    },
    resendLink: {
        fontSize: 15,
        color: '#7B61FF',
        fontWeight: '700',
    },
    resendTimer: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.4)',
    },
    resendTimerBold: {
        fontWeight: '700',
        color: '#A78BFA',
    },
    goBackText: {
        color: '#A78BFA',
        fontSize: 14,
    },
});
