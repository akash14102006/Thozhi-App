import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Image,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation, route }) {
    const { role } = route.params || { role: 'girl' }; 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    
    const getRoleMessage = () => {
        switch (role) {
            case 'girl':
                return { title: 'Welcome Back, Warrior', subtitle: 'Login to stay safe' };
            case 'family':
                return { title: 'Family Squad Login', subtitle: 'Monitor and protect your loved ones' };
            case 'police':
                return { title: 'Police Akka Login', subtitle: 'Verified officers only' };
            default:
                return { title: 'Welcome Back', subtitle: 'Login to continue' };
        }
    };

    const roleMessage = getRoleMessage();

    const handleContinue = async () => {
        if (!email.includes('@')) {
            alert("Please enter a valid email");
            return;
        }

        setIsLoading(true);
        try {
            await AuthService.sendOtp(email);
            navigation.navigate('OtpVerification', { email, role }); 
        } catch (error) {
            alert("Failed to send OTP");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <LinearGradient
                
                colors={['#12002B', '#2A0A4E', '#4B1C7A']}
                location={[0.0, 0.5, 1.0]}
                style={StyleSheet.absoluteFill}
            />

            {}
            <View style={[styles.circle, { top: -100, right: -50, backgroundColor: '#7B61FF', opacity: 0.15 }]} />
            <View style={[styles.circle, { bottom: 0, left: -100, backgroundColor: '#9A84FF', opacity: 0.1 }]} />

            {}
            <TouchableOpacity
                onPress={() => navigation.goBack()}
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
                {}
                <View style={styles.cardContainer}>
                    <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                        <View style={styles.glassContent}>

                            {}
                            <View style={styles.logoSection}>
                                <View style={styles.loginLogoContainer}>
                                    <Image source={require('../assets/images/app-logo.png')} style={styles.logoIcon} resizeMode="contain" />
                                </View>
                                <Text style={styles.appName}>Thozhi</Text>
                            </View>

                            {}
                            <Text style={styles.headerText}>{roleMessage.title}</Text>

                            {}
                            <Text style={styles.subText}>{roleMessage.subtitle}</Text>

                            {}
                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Email address</Text>
                                <View style={styles.glassInputContainer}>
                                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.glassInput}
                                        placeholder="name@example.com"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        cursorColor="#FFF"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputWrapper}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.glassInputContainer}>
                                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.glassInput}
                                        placeholder="••••••••"
                                        placeholderTextColor="rgba(255,255,255,0.6)"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        cursorColor="#FFF"
                                    />
                                </View>
                                <TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Forget Password ?</Text>
                                </TouchableOpacity>
                            </View>

                            {}
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={handleContinue}
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
                                        <Text style={styles.buttonText}>Login</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            {}
                            {}
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Are You New Member ? </Text>
                                <TouchableOpacity onPress={() => alert("Navigate to Sign Up")}>
                                    <Text style={styles.signupLink}>Sign UP</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </BlurView>
                </View>
            </KeyboardAvoidingView>
        </View>
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
    loginLogoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        overflow: 'hidden'
    },
    logoIcon: {
        width: '85%', 
        height: '85%',
    },
    appName: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
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
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 5,
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
});
