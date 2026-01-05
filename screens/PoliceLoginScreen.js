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
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';

const { width } = Dimensions.get('window');

export default function PoliceLoginScreen({ navigation }) {
    const [policeId, setPoliceId] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!policeId || phone.length < 10) {
            alert("Please enter Police ID and valid phone number");
            return;
        }

        setIsLoading(true);
        try {
            await AuthService.sendPhoneOtp(phone, 'police');
            navigation.navigate('PhoneOTP', { phone, role: 'police', policeId });
        } catch (error) {
            alert("Failed to send OTP. Please verify your Police ID.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#12002B', '#2A0A4E', '#4B1C7A']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.circle, { top: -100, right: -50, backgroundColor: '#60A5FA', opacity: 0.15 }]} />
            <View style={[styles.circle, { bottom: 0, left: -100, backgroundColor: '#3B82F6', opacity: 0.1 }]} />

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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardContainer}>
                        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                            <View style={styles.glassContent}>

                                <View style={styles.logoSection}>
                                    <View style={styles.policeBadge}>
                                        <Ionicons name="shield-checkmark" size={40} color="#60A5FA" />
                                    </View>
                                    <Text style={styles.appName}>Police Akka Login</Text>
                                    <Text style={styles.verifiedBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#34D399" /> Verified Officers Only
                                    </Text>
                                </View>

                                <Text style={styles.headerText}>Secure Access</Text>
                                <Text style={styles.subText}>Login with your official credentials</Text>

                                {}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Police ID Number</Text>
                                    <View style={styles.glassInputContainer}>
                                        <Ionicons name="card-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.glassInput}
                                            placeholder="P-12345"
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={policeId}
                                            onChangeText={setPoliceId}
                                            autoCapitalize="characters"
                                            cursorColor="#FFF"
                                        />
                                    </View>
                                </View>

                                {}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Registered Mobile Number</Text>
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

                                {}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleSendOTP}
                                    style={styles.buttonShadow}
                                >
                                    <LinearGradient
                                        colors={['#3B82F6', '#60A5FA']}
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

                                {}
                                <View style={styles.infoBox}>
                                    <Ionicons name="information-circle-outline" size={18} color="#60A5FA" />
                                    <Text style={styles.infoText}>
                                        Only verified Police Akka accounts can login. Contact your Station Admin for registration.
                                    </Text>
                                </View>

                            </View>
                        </BlurView>
                    </View>
                </ScrollView>
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
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
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
    policeBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'rgba(96, 165, 250, 0.3)',
    },
    appName: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    verifiedBadge: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
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
        marginBottom: 16,
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
        marginBottom: 20,
        shadowColor: '#3B82F6',
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
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(96, 165, 250, 0.2)',
        width: '100%',
    },
    infoText: {
        flex: 1,
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        lineHeight: 18,
        marginLeft: 10,
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
