import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';
import { PhoneAuthService } from '../services/phoneAuthService';

import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width } = Dimensions.get('window');

export default function GirlLoginScreen({ navigation }) {
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            
            const token = userInfo.data?.idToken || userInfo.idToken;
            console.log("ID TOKEN:", token);

            // Link with Firebase Auth using the token
            const result = await AuthService.googleLoginWithCredential(token, 'girl');

            if (result.success) {
                if (result.isNewUser) {
                    navigation.navigate('GirlSignup', { userData: result.userData });
                } else {
                    navigation.navigate('Home');
                }
            }
        } catch (error) {
            console.error("Google Native Sign-In Error", error);
            Alert.alert("Login Failed", "Could not verify account.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleButtonPress = () => {
        handleGoogleSignIn();
    };

    const handleSendOTP = async () => {
        if (phone.length < 10) {
            Alert.alert("Invalid Number", "Please enter a valid 10-digit phone number.");
            return;
        }

        setIsLoading(true);
        try {
            const fullPhone = `+91${phone}`;
            console.log('[GirlLogin] 📱 Sending OTP to:', fullPhone);

            const result = await PhoneAuthService.sendOTP(fullPhone);

            if (result.success) {
                console.log('[GirlLogin] ✅ OTP sent, navigating to verification...');
                navigation.navigate('PhoneOTP', {
                    phone,
                    role: 'girl',
                    confirmationResult: result.confirmationResult,
                });
            } else {
                Alert.alert("OTP Failed", result.error || "Failed to send OTP. Please try again.");
            }
        } catch (error) {
            console.error('[GirlLogin] ❌ OTP Error:', error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            { }
            <LinearGradient
                colors={['#12002B', '#2A0A4E', '#4B1C7A']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.circle, { top: -100, right: -50, backgroundColor: '#7B61FF', opacity: 0.15 }]} />
            <View style={[styles.circle, { bottom: 0, left: -100, backgroundColor: '#9A84FF', opacity: 0.1 }]} />

            {/* Back Button */}
            <TouchableOpacity
                onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('RoleSelection')}
                activeOpacity={0.7}
                style={styles.backButtonContainer}
            >
                <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
                    <Ionicons name="arrow-back" size={22} color="#FFF" />
                </BlurView>
            </TouchableOpacity>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardContainer}
            >
                <View style={styles.cardContainer}>
                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                        <View style={styles.glassContent}>

                            { }
                            <View style={styles.logoSection}>
                                <View style={styles.iconContainer}>
                                    <MaterialCommunityIcons name="face-woman-shimmer" size={42} color="#FFF" />
                                </View>
                                <Text style={styles.appName}>Girl / Woman Login</Text>
                            </View>

                            <Text style={styles.headerText}>Welcome Back, Warrior</Text>
                            <Text style={styles.subText}>Login with phone number</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginBottom: 10 }}>V2.9 - Force Update</Text>

                            { }
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <View style={styles.glassInputContainer}>
                                    <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                    <Text style={styles.countryCode}>+91</Text>
                                    <TextInput
                                        style={styles.glassInput}
                                        placeholder="9876543210"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        cursorColor="#FFF"
                                    />
                                </View>
                            </View>

                            { }
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleSendOTP}
                                style={styles.buttonShadow}
                            >
                                <LinearGradient
                                    colors={['#7B61FF', '#9A84FF']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.continueButton}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Send OTP</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            { }
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={handleGoogleButtonPress}
                                    disabled={isLoading}
                                >
                                    <Ionicons name="logo-google" size={24} color="#FFF" />
                                </TouchableOpacity>
                                { }
                            </View>

                            { }
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>New here? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('GirlSignup')}>
                                    <Text style={styles.signupLink}>Create Account</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </BlurView>
                </View>
            </KeyboardAvoidingView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContainer: {
        width: width * 0.88,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 40,
        elevation: 20,
    },
    blurContainer: {
        width: '100%',
    },
    glassContent: {
        padding: 28,
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    appName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 1,
        opacity: 0.9,
    },
    headerText: {
        fontSize: 26,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 5,
        textAlign: 'center',
    },
    subText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 4,
    },
    glassInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        height: 52,
        paddingHorizontal: 15,
    },
    inputIcon: {
        marginRight: 10,
    },
    countryCode: {
        color: '#FFF',
        fontSize: 16,
        marginRight: 5,
        fontWeight: '600',
    },
    glassInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        height: '100%',
    },
    buttonShadow: {
        width: '100%',
        marginTop: 20,
        shadowColor: '#7B61FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    continueButton: {
        height: 54,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footer: {
        marginTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    },
    signupLink: {
        color: '#7B61FF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    circle: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    backButtonContainer: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 50 : 60,
        left: 20,
        zIndex: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    backButtonBlur: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 24,
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        paddingHorizontal: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
    },
    socialButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
});
