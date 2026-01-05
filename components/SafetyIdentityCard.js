import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

export default function SafetyIdentityCard({ safetyId, userName, onClose }) {
    const [showQR, setShowQR] = useState(false);

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
                    {}
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    {}
                    <BlurView intensity={40} tint="dark" style={styles.cardContainer}>
                        <LinearGradient
                            colors={['rgba(123, 97, 255, 0.15)', 'rgba(154, 132, 255, 0.1)']}
                            style={styles.cardGradient}
                        >
                            {}
                            <View style={styles.cardHeader}>
                                <Ionicons name="shield-checkmark" size={40} color="#7B61FF" />
                                <Text style={styles.cardTitle}>Safety Identity</Text>
                                <Text style={styles.cardSubtitle}>Smart Verification System</Text>
                            </View>

                            {}
                            <View style={styles.userSection}>
                                <Text style={styles.userName}>{userName || 'Warrior'}</Text>
                                <View style={styles.divider} />
                            </View>

                            {}
                            <View style={styles.idSection}>
                                <Text style={styles.idLabel}>Safety ID</Text>
                                <View style={styles.idBox}>
                                    <Text style={styles.idValue}>{safetyId}</Text>
                                    <TouchableOpacity onPress={handleShare} style={styles.copyButton}>
                                        <Ionicons name="share-outline" size={20} color="#7B61FF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {}
                            {showQR ? (
                                <View style={styles.qrSection}>
                                    <View style={styles.qrContainer}>
                                        <QRCode
                                            value={safetyId}
                                            size={180}
                                            backgroundColor="transparent"
                                            color="#FFFFFF"
                                        />
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

                            {}
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

                            {}
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
        color: '#7B61FF',
        fontSize: 14,
        fontWeight: '600',
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
});
