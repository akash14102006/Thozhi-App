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
    ScrollView,
    Modal
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AuthService } from '../services/authService';
import { Camera, CameraView } from 'expo-camera';

const { width, height } = Dimensions.get('window');

export default function FamilySignupScreen({ navigation, route }) {
    const { phone, userData } = route.params || {};
    const parentKey = phone || userData?.email || 'DEBUG_PARENT';
    const [girlId, setGirlId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };
        getCameraPermissions();
    }, []);

    const handleLinkToGirl = async (manualId = null, token = null) => {
        const targetId = manualId || girlId;
        if (!targetId) {
            alert("Please enter or scan a Girl Safety ID");
            return;
        }

        setIsLoading(true);
        try {
            const result = await AuthService.linkFamilyToGirl(parentKey, targetId, token);

            if (result.success) {
                alert(`Request sent to ${targetId.split('-')[0]}! Waiting for approval.`);
                navigation.replace('FamilyDashboard');
            } else {
                alert(result.message || "Failed to link account");
            }
        } catch (error) {
            alert("An error occurred. Please check the ID.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBarCodeScanned = ({ data }) => {
        if (!showScanner) return;
        setShowScanner(false);

        // QR Format: SAFETY_ID|TOKEN
        const parts = data.split('|');
        const scannnedId = parts[0];
        const token = parts[1] || null;

        if (scannnedId.startsWith('THOZHI-')) {
            setGirlId(scannnedId);
            handleLinkToGirl(scannnedId, token);
        } else {
            alert("Invalid Thozhi QR Code.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#1F0A3C', '#2E1065', '#4C1D95']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.circle, { top: -100, right: -50, backgroundColor: '#A78BFA' }]} />
            <View style={[styles.circle, { bottom: -150, left: -100, backgroundColor: '#EC4899' }]} />

            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
                <BlurView intensity={20} tint="dark" style={styles.backButtonBlur}>
                    <Ionicons name="arrow-back" size={22} color="#FFF" />
                </BlurView>
            </TouchableOpacity>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.cardContainer}>
                        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                            <View style={styles.glassContent}>
                                <View style={styles.logoSection}>
                                    <View style={styles.iconOrb}>
                                        <LinearGradient colors={['rgba(167, 139, 250, 0.3)', 'rgba(76, 29, 149, 0.3)']} style={styles.iconGlass}>
                                            <MaterialCommunityIcons name="link-variant" size={42} color="#FFF" />
                                        </LinearGradient>
                                    </View>
                                    <Text style={styles.appName}>Thozhi Family Squad</Text>
                                </View>

                                <Text style={styles.headerText}>Link Your Account</Text>
                                <Text style={styles.subText}>Connect with your ward using their Safety ID</Text>

                                <TouchableOpacity style={styles.qrScanCard} activeOpacity={0.8} onPress={() => setShowScanner(true)}>
                                    <LinearGradient colors={['rgba(167, 139, 250, 0.15)', 'rgba(124, 58, 237, 0.15)']} style={styles.qrContent}>
                                        <View style={styles.qrIconBubble}>
                                            <MaterialIcons name="qr-code-scanner" size={28} color="#FFF" />
                                        </View>
                                        <View style={styles.qrTextContainer}>
                                            <Text style={styles.qrTitle}>Scan QR Code</Text>
                                            <Text style={styles.qrSubtitle}>Instant link with your ward</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OR ENTER ID MANUALLY</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <View style={styles.inputWrapper}>
                                    <View style={styles.glassInputContainer}>
                                        <View style={styles.inputParams}>
                                            <Text style={styles.inputLabelSmall}>SAFETY ID</Text>
                                            <TextInput
                                                style={styles.glassInput}
                                                placeholder="THOZHI-XXXXXX"
                                                placeholderTextColor="rgba(255,255,255,0.3)"
                                                value={girlId}
                                                onChangeText={setGirlId}
                                                autoCapitalize="characters"
                                                cursorColor="#A78BFA"
                                            />
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity activeOpacity={0.9} onPress={() => handleLinkToGirl()} style={styles.buttonShadow}>
                                    <LinearGradient colors={['#A78BFA', '#C084FC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.continueButton}>
                                        {isLoading ? <ActivityIndicator color="#FFF" /> : (
                                            <>
                                                <Text style={styles.buttonText}>Send Link Request</Text>
                                                <Ionicons name="send" size={18} color="#FFF" style={styles.buttonIcon} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.securityBadge}>
                                    <Ionicons name="lock-closed" size={14} color="#34D399" />
                                    <Text style={styles.securityText}> Privacy protected - Approval required</Text>
                                </View>
                            </View>
                        </BlurView>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Scanner Modal */}
            <Modal visible={showScanner} animationType="slide" transparent={true}>
                <View style={styles.scannerModal}>
                    <CameraView
                        style={StyleSheet.absoluteFill}
                        onBarcodeScanned={handleBarCodeScanned}
                        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    />
                    <View style={styles.scannerOverlay}>
                        <BlurView intensity={20} tint="dark" style={styles.scannerHeader}>
                            <Text style={styles.scannerTitle}>Align QR Code</Text>
                            <TouchableOpacity onPress={() => setShowScanner(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={28} color="#FFF" />
                            </TouchableOpacity>
                        </BlurView>
                        <View style={styles.qrFrame} />
                        <Text style={styles.scannerHint}>Scanning for Thozhi Safety ID...</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1F0A3C' },
    keyboardContainer: { flex: 1 },
    scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
    cardContainer: { width: width * 0.9, borderRadius: 32, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)' },
    blurContainer: { width: '100%' },
    glassContent: { padding: 30, alignItems: 'center' },
    iconOrb: { width: 80, height: 80, borderRadius: 25, backgroundColor: 'rgba(167, 139, 250, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    iconGlass: { width: 80, height: 80, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    logoSection: { alignItems: 'center', marginBottom: 20 },
    appName: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 'bold' },
    headerText: { fontSize: 26, fontWeight: 'bold', color: '#FFF', marginBottom: 6, textAlign: 'center' },
    subText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 30, textAlign: 'center' },
    qrScanCard: { width: '100%', height: 80, borderRadius: 20, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(167, 139, 250, 0.3)' },
    qrContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
    qrIconBubble: { width: 46, height: 46, borderRadius: 14, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    qrTextContainer: { flex: 1 },
    qrTitle: { color: '#FFF', fontSize: 17, fontWeight: 'bold' },
    qrSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 24 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    dividerText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', paddingHorizontal: 12 },
    inputWrapper: { width: '100%', marginBottom: 30 },
    glassInputContainer: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', height: 64, paddingHorizontal: 18, justifyContent: 'center' },
    inputParams: { flex: 1, justifyContent: 'center' },
    inputLabelSmall: { color: '#A78BFA', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
    glassInput: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    buttonShadow: { width: '100%', marginBottom: 24, shadowColor: '#A78BFA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 12 },
    continueButton: { height: 58, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    buttonIcon: { marginLeft: 10 },
    securityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.2)' },
    securityText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
    circle: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.1 },
    backButtonContainer: { position: 'absolute', top: Platform.OS === 'android' ? 50 : 60, left: 20, zIndex: 100 },
    backButtonBlur: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },

    // Scanner Styles
    scannerModal: { flex: 1, backgroundColor: '#000' },
    scannerOverlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 60 },
    scannerHeader: { width: width * 0.9, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, overflow: 'hidden' },
    scannerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    qrFrame: { width: 250, height: 250, borderWidth: 2, borderColor: '#A78BFA', borderRadius: 20, backgroundColor: 'rgba(167, 139, 250, 0.1)' },
    scannerHint: { color: '#FFF', fontSize: 14, opacity: 0.8, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
});
