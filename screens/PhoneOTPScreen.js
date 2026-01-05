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
    Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';

const { width } = Dimensions.get('window');

export default function PhoneOTPScreen({ navigation, route }) {
    const { phone, role } = route.params || {};
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        if (inputRefs.current[0]) {
            setTimeout(() => inputRefs.current[0].focus(), 300);
        }
    }, []);

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 4) {
            alert('Please enter complete OTP');
            return;
        }

        setLoading(true);
        try {
            const result = await AuthService.verifyPhoneOtp(phone, otpCode, role);

            if (result.success) {
                if (result.isNewUser) {
                    if (role === 'girl') {
                        navigation.replace('GirlSignup', { phone });
                    } else if (role === 'family') {
                        navigation.replace('FamilySignup', { phone });
                    }
                } else {
                    
                    if (role === 'girl') {
                        navigation.replace('Home');
                    } else if (role === 'family') {
                        navigation.replace('FamilyDashboard');
                    }
                }
            } else {
                alert(result.message || 'Verification failed');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (text, index) => {
        if (text && !/^\d+$/.test(text)) return;

        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const maskedPhone = phone ? `+91 ${phone.slice(0, 2)}****${phone.slice(-4)}` : '+91 98****4567';

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            {}
            <LinearGradient
                colors={['#1c0c2e', '#2e1065', '#491c7a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {}
            <View style={[styles.glowCircle, { top: -100, right: -80, backgroundColor: '#7B61FF' }]} />
            <View style={[styles.glowCircle, { bottom: -120, left: -60, backgroundColor: '#9A84FF' }]} />

            {}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
                style={styles.backButton}
            >
                <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
                    <Ionicons name="arrow-back" size={22} color="#FFF" />
                </BlurView>
            </TouchableOpacity>

            {}
            <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>

                {}
                {}
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

                {}
                <Text style={styles.mainTitle}>Verification Code</Text>
                <Text style={styles.subtitle}>
                    We've sent a code to{'\n'}
                    <Text style={styles.phoneHighlight}>{maskedPhone}</Text>
                </Text>

                
                <View style={styles.otpSection}>
                    <View style={styles.otpRow}>
                        {otp.map((digit, index) => (
                            <View key={index} style={styles.otpInputWrapper}>
                                <BlurView intensity={20} tint="light" style={styles.otpBlur}>
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
                                    />
                                    {digit ? <View style={styles.activeBorder} /> : null}
                                </BlurView>
                            </View>
                        ))}
                    </View>
                </View>

                
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    style={styles.verifyButtonContainer}
                >
                    <LinearGradient
                        colors={['#7B61FF', '#9A84FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.verifyButton}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                
                <TouchableOpacity style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive code? </Text>
                    <Text style={styles.resendLink}>Resend</Text>
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
        blur: 100,
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
        marginBottom: 48,
    },
    phoneHighlight: {
        color: '#7B61FF',
        fontWeight: '700',
        fontSize: 17,
    },
    otpSection: {
        width: '100%',
        marginBottom: 40,
    },
    otpRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    otpInputWrapper: {
        width: 65,
        height: 70,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    otpBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otpInput: {
        width: '100%',
        height: '100%',
        color: '#FFF',
        fontSize: 32,
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
        backgroundColor: '#A78BFA', 
        borderRadius: 2,
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
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
});
