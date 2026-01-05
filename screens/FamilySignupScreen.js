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
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';

const { width } = Dimensions.get('window');

export default function FamilySignupScreen({ navigation, route }) {
    const { phone } = route.params || {};
    const [girlId, setGirlId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLinkToGirl = async () => {
        if (!girlId) {
            alert("Please enter Girl Safety ID");
            return;
        }

        setIsLoading(true);
        try {
            const result = await AuthService.linkFamilyToGirl(phone, girlId);

            if (result.success) {
                if (result.pending) {
                    alert("Request sent! Waiting for approval from the girl.");
                    navigation.replace('FamilyDashboard');
                }
            } else {
                alert(result.message || "Failed to link account");
            }
        } catch (error) {
            alert("An error occurred");
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

            <View style={[styles.circle, { top: -100, right: -50, backgroundColor: '#A78BFA', opacity: 0.15 }]} />
            <View style={[styles.circle, { bottom: 0, left: -100, backgroundColor: '#C084FC', opacity: 0.1 }]} />

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
                                    <View style={styles.iconOrb}>
                                        <LinearGradient
                                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                                            style={styles.iconGlass}
                                        >
                                            <MaterialCommunityIcons name="link-variant" size={42} color="#A78BFA" />
                                        </LinearGradient>
                                    </View>
                                    <Text style={styles.appName}>Family Squad</Text>
                                </View>

                                <Text style={styles.headerText}>Link with Girl Account</Text>
                                <Text style={styles.subText}>Enter the Safety ID to connect</Text>

                                {}
                                <TouchableOpacity style={styles.qrScanCard} activeOpacity={0.8} onPress={() => alert('QR Scanner coming soon!')}>
                                    <LinearGradient
                                        colors={['rgba(167, 139, 250, 0.2)', 'rgba(76, 29, 149, 0.2)']}
                                        style={styles.qrContent}
                                    >
                                        <View style={styles.qrIconBubble}>
                                            <MaterialIcons name="qr-code-scanner" size={28} color="#FFF" />
                                        </View>
                                        <View style={styles.qrTextContainer}>
                                            <Text style={styles.qrTitle}>Scan QR Code</Text>
                                            <Text style={styles.qrSubtitle}>Instant link with your ward</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR ENTER ID MANUALLY</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {}
                                <View style={styles.inputWrapper}>
                                    <View style={styles.glassInputContainer}>
                                        <View style={styles.inputParams}>
                                            <Text style={styles.inputLabelSmall}>SAFETY ID</Text>
                                            <TextInput
                                                style={styles.glassInput}
                                                placeholder="Girl#1234"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={girlId}
                                                onChangeText={setGirlId}
                                                autoCapitalize="characters"
                                                cursorColor="#A78BFA"
                                            />
                                        </View>
                                        <TouchableOpacity style={styles.pasteBtn} onPress={() => alert('Paste')}>
                                            <Text style={styles.pasteText}>PASTE</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {}
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleLinkToGirl}
                                    style={styles.buttonShadow}
                                >
                                    <LinearGradient
                                        colors={['#A78BFA', '#C084FC']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.continueButton}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <>
                                                <Text style={styles.buttonText}>Send Link Request</Text>
                                                <Ionicons name="send" size={18} color="#FFF" style={styles.buttonIcon} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.securityBadge}>
                                    <Ionicons name="lock-closed" size={14} color="#34D399" />
                                    <Text style={styles.securityText}>  Privacy protected - Needs girl's approval</Text>
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
    iconOrb: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15,
        marginBottom: 12,
    },
    iconGlass: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    qrScanCard: {
        width: '100%',
        height: 70,
        borderRadius: 18,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    qrContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    qrIconBubble: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#7C3AED',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    qrTextContainer: { flex: 1 },
    qrTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    qrSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    dividerText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 12,
        letterSpacing: 1,
    },
    inputWrapper: {
        width: '100%',
        marginBottom: 30,
    },
    glassInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(20, 10, 40, 0.4)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
        height: 64,
        paddingHorizontal: 16,
    },
    inputParams: { flex: 1, justifyContent: 'center' },
    inputLabelSmall: {
        color: '#A78BFA',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    glassInput: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
        padding: 0,
    },
    pasteBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 8,
    },
    pasteText: {
        color: '#A78BFA',
        fontSize: 10,
        fontWeight: 'bold',
    },
    buttonShadow: {
        width: '100%',
        marginBottom: 20,
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    continueButton: {
        height: 54,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    buttonIcon: {
        marginLeft: 8,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
    },
    securityText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
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
