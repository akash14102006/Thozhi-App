/**
 * ========================================
 * THOZHI - Phone OTP Verification Screen
 * ========================================
 * Production-level OTP verification with:
 * - 6-digit code input
 * - Auto-verification detection
 * - Resend with cooldown timer
 * - Error handling with user-friendly messages
 * - Loading states
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
import { PhoneAuthService } from '../services/phoneAuthService';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30; // seconds

export default function PhoneOTPScreen({ navigation, route }) {
    const { phone, role, confirmationResult: initialConfirmation } = route.params || {};

    // State
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [confirmationResult, setConfirmationResult] = useState(initialConfirmation);
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Refs
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

        // Auto focus first input
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

    // ===== AUTH STATE LISTENER (Auto-verification) =====
    useEffect(() => {
        console.log('[OTPScreen] 👂 Setting up auth state listener for auto-verification...');
        const unsubscribe = PhoneAuthService.onAuthStateChange(async (user) => {
            if (user && user.phoneNumber) {
                console.log('[OTPScreen] 🎉 Auto-verified! Navigating...');
                // User was auto-verified by Android
                try {
                    const result = await PhoneAuthService.syncUserToFirestore(user, role);
                    handleNavigationAfterAuth(result);
                } catch (error) {
                    console.error('[OTPScreen] Auto-verify sync error:', error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    // ===== SHAKE ERROR ANIMATION =====
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    // ===== NAVIGATION AFTER AUTH =====
    const handleNavigationAfterAuth = (result) => {
        if (result.isNewUser) {
            if (role === 'girl') {
                navigation.replace('GirlSignup', { phone });
            } else if (role === 'family') {
                navigation.replace('FamilySignup', { phone });
            }
        } else {
            navigation.replace('LoginSuccess', {
                role: role,
                userName: result.userData?.name || 'Warrior',
            });
        }
    };

    // ===== VERIFY OTP =====
    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        setErrorMessage('');

        if (otpCode.length !== OTP_LENGTH) {
            setErrorMessage(`Please enter the complete ${OTP_LENGTH}-digit code`);
            triggerShake();
            return;
        }

        if (!confirmationResult) {
            setErrorMessage('Session expired. Please request a new OTP.');
            triggerShake();
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        try {
            console.log('[OTPScreen] 🔐 Verifying OTP:', otpCode);
            const result = await PhoneAuthService.verifyOTP(confirmationResult, otpCode, role);

            if (result.success) {
                console.log('[OTPScreen] ✅ Verification successful!');
                handleNavigationAfterAuth(result);
            } else {
                console.log('[OTPScreen] ❌ Verification failed:', result.error);
                setErrorMessage(result.error);
                triggerShake();
                // Clear OTP fields on wrong code
                setOtp(new Array(OTP_LENGTH).fill(''));
                setTimeout(() => inputRefs.current[0]?.focus(), 300);
            }
        } catch (error) {
            console.error('[OTPScreen] Unexpected error:', error);
            setErrorMessage('Something went wrong. Please try again.');
            triggerShake();
        } finally {
            setLoading(false);
        }
    };

    // ===== RESEND OTP =====
    const handleResendOtp = async () => {
        if (!canResend || resendLoading) return;

        setResendLoading(true);
        setErrorMessage('');

        try {
            const fullPhone = `+91${phone}`;
            console.log('[OTPScreen] 🔄 Resending OTP to:', fullPhone);

            const result = await PhoneAuthService.sendOTP(fullPhone);

            if (result.success) {
                setConfirmationResult(result.confirmationResult);
                setResendTimer(RESEND_COOLDOWN);
                setCanResend(false);
                setOtp(new Array(OTP_LENGTH).fill(''));
                Alert.alert('OTP Sent', 'A new verification code has been sent to your phone.');
                setTimeout(() => inputRefs.current[0]?.focus(), 300);
            } else {
                setErrorMessage(result.error);
                triggerShake();
            }
        } catch (error) {
            setErrorMessage('Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // ===== OTP INPUT HANDLERS =====
    const handleOtpChange = (text, index) => {
        if (text && !/^\d+$/.test(text)) return;

        const newOtp = [...otp];

        // Handle paste (user pasted full OTP)
        if (text.length > 1) {
            const pasted = text.slice(0, OTP_LENGTH).split('');
            for (let i = 0; i < OTP_LENGTH; i++) {
                newOtp[i] = pasted[i] || '';
            }
            setOtp(newOtp);
            // Focus last filled input or verify button
            const lastIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
            inputRefs.current[lastIndex]?.focus();

            // Auto-verify if full OTP pasted
            if (pasted.length >= OTP_LENGTH) {
                setTimeout(() => handleVerifyOtp(), 300);
            }
            return;
        }

        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when last digit is entered
        if (text && index === OTP_LENGTH - 1) {
            const fullCode = newOtp.join('');
            if (fullCode.length === OTP_LENGTH) {
                setTimeout(() => handleVerifyOtp(), 200);
            }
        }

        // Clear error on input
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

    // ===== MASKED PHONE =====
    const maskedPhone = phone
        ? `+91 ${phone.slice(0, 2)}****${phone.slice(-2)}`
        : '+91 98****67';

    // ===== RENDER =====
    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background */}
            <LinearGradient
                colors={['#1c0c2e', '#2e1065', '#491c7a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Glow circles */}
            <View style={[styles.glowCircle, { top: -100, right: -80, backgroundColor: '#7B61FF' }]} />
            <View style={[styles.glowCircle, { bottom: -120, left: -60, backgroundColor: '#9A84FF' }]} />

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

            {/* Content */}
            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

                {/* Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconOrb}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                            style={styles.iconGlass}
                        >
                            <Ionicons name="shield-checkmark" size={42} color="#A78BFA" />
                        </LinearGradient>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.mainTitle}>Verification Code</Text>
                <Text style={styles.subtitle}>
                    We've sent a {OTP_LENGTH}-digit code to{'\n'}
                    <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
                </Text>

                {/* OTP Input */}
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
                                    editable={!loading}
                                />
                                {digit ? <View style={styles.activeBorder} /> : null}
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Error Message */}
                {errorMessage ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                ) : null}

                {/* Verify Button */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleVerifyOtp}
                    disabled={loading || otp.join('').length !== OTP_LENGTH}
                    style={[
                        styles.verifyButtonContainer,
                        (loading || otp.join('').length !== OTP_LENGTH) ? { opacity: 0.6 } : null,
                    ]}
                >
                    <LinearGradient
                        colors={['#7B61FF', '#9A84FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.verifyButton}
                    >
                        {loading ? (
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

                {/* Resend OTP */}
                <TouchableOpacity
                    style={styles.resendContainer}
                    onPress={handleResendOtp}
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

                {/* Debug info */}
                {__DEV__ && (
                    <Text style={styles.debugText}>
                        Debug: {confirmationResult ? '✅ Confirmation OK' : '❌ No confirmation'}
                    </Text>
                )}

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
        fontSize: 34,
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
    phoneHighlight: {
        color: '#7B61FF',
        fontWeight: '700',
        fontSize: 17,
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
        textShadowColor: 'rgba(167, 139, 250, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
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
    debugText: {
        marginTop: 20,
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
    },
});
