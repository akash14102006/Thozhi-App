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

export default function GirlSignupScreen({ navigation, route }) {
    const { phone } = route.params || {};
    const [name, setName] = useState('');
    const [emergencyContactName, setEmergencyContactName] = useState('');
    const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateProfile = async () => {
        if (!name || !emergencyContactName || !emergencyContactPhone) {
            alert("Please fill all fields");
            return;
        }

        setIsLoading(true);
        try {
            const result = await AuthService.createGirlProfile(phone, {
                name,
                emergencyContacts: [{
                    name: emergencyContactName,
                    phone: emergencyContactPhone,
                    relation: 'Parent'
                }]
            });

            if (result.success) {
                
                navigation.replace('Home');
            }
        } catch (error) {
            alert("Failed to create profile");
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
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.cardContainer}>
                        <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
                            <View style={styles.glassContent}>

                                <View style={styles.logoSection}>
                                    <Text style={styles.emoji}>🛡️</Text>
                                    <Text style={styles.appName}>Create Your Safety Profile</Text>
                                </View>

                                <Text style={styles.headerText}>Welcome, Warrior</Text>
                                <Text style={styles.subText}>Tell us about yourself</Text>

                                {}
                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Your Name</Text>
                                    <View style={styles.glassInputContainer}>
                                        <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.glassInput}
                                            placeholder="Enter your name"
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={name}
                                            onChangeText={setName}
                                            cursorColor="#FFF"
                                        />
                                    </View>
                                </View>

                                {}
                                <Text style={styles.sectionTitle}>Emergency Contact (Parent/Guardian)</Text>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Contact Name</Text>
                                    <View style={styles.glassInputContainer}>
                                        <Ionicons name="heart-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.glassInput}
                                            placeholder="Father/Mother name"
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={emergencyContactName}
                                            onChangeText={setEmergencyContactName}
                                            cursorColor="#FFF"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputWrapper}>
                                    <Text style={styles.label}>Contact Phone</Text>
                                    <View style={styles.glassInputContainer}>
                                        <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.7)" style={styles.inputIcon} />
                                        <Text style={styles.countryCode}>+91</Text>
                                        <TextInput
                                            style={styles.glassInput}
                                            placeholder="9876543210"
                                            placeholderTextColor="rgba(255,255,255,0.6)"
                                            value={emergencyContactPhone}
                                            onChangeText={setEmergencyContactPhone}
                                            keyboardType="phone-pad"
                                            maxLength={10}
                                            cursorColor="#FFF"
                                        />
                                    </View>
                                </View>

                                {}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleCreateProfile}
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
                                            <Text style={styles.buttonText}>Create Profile</Text>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.footer}>
                                    <Ionicons name="shield-checkmark" size={16} color="#7B61FF" />
                                    <Text style={styles.footerText}>  Your data is encrypted & secure</Text>
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
    emoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    appName: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 1,
        opacity: 0.9,
        textAlign: 'center',
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
    sectionTitle: {
        color: '#7B61FF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 15,
        alignSelf: 'flex-start',
        width: '100%',
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
        marginTop: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
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
