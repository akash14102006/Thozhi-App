import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Share, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import QRCode from 'react-native-qrcode-svg';

export default function SafetyIdentityCard({ safetyId, userName, navigation, onClose }) {
    const [showQR, setShowQR] = useState(false);
    const [secureToken, setSecureToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

    useEffect(() => {
        let timer;
        if (showQR) {
            const generateNewToken = async () => {
                try {
                    const token = Math.random().toString(36).substring(7).toUpperCase();
                    setSecureToken(token);
                    setTimeLeft(600);

                    // Update live token in Firestore so Family Squad can verify it
                    if (safetyId) {
                        const userRef = doc(db, "users", safetyId);
                        await updateDoc(userRef, {
                            currentSecureToken: token,
                            tokenGeneratedAt: new Date().toISOString()
                        });
                        console.log(`[SafetyCard] Live Token Synced to cloud: ${token}`);
                    }
                } catch (e) {
                    console.log("Token sync failed", e);
                }
            };

            generateNewToken();

            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        generateNewToken();
                        return 600;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showQR]);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `My Safety ID: ${safetyId}\n\nUse this ID to connect with me securely on the Women Safety Network.`,
                title: 'Share Safety ID',
            });
        } catch (error) {
            console.log('Share failed', error);
        }
    };

    return (
        <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <LinearGradient
                    colors={['rgba(26, 0, 51, 0.95)', 'rgba(45, 27, 78, 0.95)']}
                    style={styles.modalBackground}
                />

                <View style={styles.modalContent}>
                    { }
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    { }
                    <BlurView intensity={40} tint="dark" style={styles.cardContainer}>
                        <LinearGradient
                            colors={['rgba(123, 97, 255, 0.15)', 'rgba(154, 132, 255, 0.1)']}
                            style={styles.cardGradient}
                        >
                            { }
                            <View style={styles.cardHeader}>
                                <Ionicons name="shield-checkmark" size={40} color="#7B61FF" />
                                <Text style={styles.cardTitle}>Safety Identity</Text>
                                <Text style={styles.cardSubtitle}>Smart Verification System</Text>
                            </View>

                            { }
                            <View style={styles.userSection}>
                                <Text style={styles.userName}>{userName || 'Warrior'}</Text>
                                <View style={styles.divider} />
                            </View>

                            { }
                            <View style={styles.idSection}>
                                <Text style={styles.idLabel}>Safety ID</Text>
                                <View style={styles.idBox}>
                                    <Text style={styles.idValue}>{safetyId}</Text>
                                    <TouchableOpacity onPress={handleShare} style={styles.copyButton}>
                                        <Ionicons name="share-outline" size={20} color="#7B61FF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            { }
                            {showQR ? (
                                <View style={styles.qrSection}>
                                    <View style={styles.qrContainer}>
                                        {(!secureToken || !safetyId) ? (
                                            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                                                <ActivityIndicator size="large" color="#7B61FF" />
                                                <Text style={{ marginTop: 10, color: '#666', fontSize: 12 }}>Generating secure token...</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <QRCode
                                                    value={`${safetyId}|${secureToken}`}
                                                    size={200}
                                                    backgroundColor="white"
                                                    color="black"
                                                    ecl="H"
                                                />
                                            </>
                                        )}
                                    </View>

                                    {/* Textual Backup for Manual Entry */}
                                    {secureToken && (
                                        <View style={styles.tokenDisplay}>
                                            <Text style={styles.tokenLabel}>SECURE TOKEN:</Text>
                                            <Text style={styles.tokenValue}>{secureToken}</Text>
                                        </View>
                                    )}

                                    <View style={styles.expiryBadge}>
                                        <Ionicons name="timer-outline" size={14} color="#7B61FF" />
                                        <Text style={styles.expiryText}>Refreshes in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setShowQR(false)}
                                        style={styles.qrToggle}
                                    >
                                        <Text style={styles.qrToggleText}>Hide QR Code</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setShowQR(true)}
                                    style={styles.showQrButton}
                                >
                                    <LinearGradient
                                        colors={['#7B61FF', '#9A84FF']}
                                        style={styles.showQrGradient}
                                    >
                                        <Ionicons name="qr-code-outline" size={20} color="#FFF" />
                                        <Text style={styles.showQrText}>Show QR Code</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            { }
                            <View style={styles.infoSection}>
                                <View style={styles.infoItem}>
                                    <Ionicons name="people-outline" size={16} color="#A78BFA" />
                                    <Text style={styles.infoText}>Parent Linking</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Ionicons name="shield-outline" size={16} color="#60A5FA" />
                                    <Text style={styles.infoText}>Police Verification</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Ionicons name="alert-circle-outline" size={16} color="#EC4899" />
                                    <Text style={styles.infoText}>Emergency Reference</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.manageFamilyBtn}
                                onPress={() => {
                                    onClose();
                                    if (navigation) navigation.navigate('Family');
                                }}
                            >
                                <LinearGradient
                                    colors={['#4C1D95', '#2E1065']}
                                    style={styles.manageFamilyGradient}
                                >
                                    <Ionicons name="settings-outline" size={18} color="#FFF" />
                                    <Text style={styles.manageFamilyText}>Manage Family Connections</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            { }
                            <View style={styles.securityBadge}>
                                <Ionicons name="lock-closed" size={14} color="#34D399" />
                                <Text style={styles.securityText}>No phone number sharing required</Text>
                            </View>
                        </LinearGradient>
                    </BlurView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '90%',
        maxWidth: 400,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
    },
    cardContainer: {
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    cardGradient: {
        padding: 28,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginTop: 12,
    },
    cardSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    userSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 12,
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: '#7B61FF',
        borderRadius: 1,
    },
    idSection: {
        marginBottom: 24,
    },
    idLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginBottom: 8,
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    idBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(123, 97, 255, 0.2)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(123, 97, 255, 0.4)',
    },
    idValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#7B61FF',
        letterSpacing: 2,
    },
    copyButton: {
        marginLeft: 12,
        padding: 8,
    },
    qrSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 16,
    },
    qrToggle: {
        padding: 8,
    },
    qrToggleText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontWeight: '600',
    },
    expiryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        backgroundColor: 'rgba(123, 97, 255, 0.1)',
        borderRadius: 20,
        marginBottom: 10,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(123, 97, 255, 0.2)',
    },
    expiryText: {
        color: '#A78BFA',
        fontSize: 12,
        fontWeight: 'bold',
    },
    showQrButton: {
        marginBottom: 20,
        borderRadius: 16,
        overflow: 'hidden',
    },
    showQrGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    showQrText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoSection: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    infoText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
    },
    securityText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 11,
        fontWeight: '600',
    },
    manageFamilyBtn: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    manageFamilyGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    manageFamilyText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
    tokenDisplay: {
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tokenLabel: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    tokenValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 3,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
