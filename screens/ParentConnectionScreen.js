import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function ParentConnectionScreen({ navigation }) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInvite = () => {
        if (phoneNumber.length < 10) {
            Alert.alert("Invalid Number", "Please enter a valid phone number.");
            return;
        }

        setIsSubmitting(true);
        
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                "Invite Sent!",
                `An invite link has been sent to ${phoneNumber}. Once they accept, they will be added to your trusted circle.`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#12002B', '#2A0A4E', '#1F2937']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Link Parent</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-checkmark" size={60} color="#34D399" />
                    </View>

                    <Text style={styles.title}>Add a Guardian</Text>
                    <Text style={styles.subtitle}>
                        They will receive your live location and safety alerts. They cannot control your phone or edit your routes.
                    </Text>

                    <BlurView intensity={20} style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#A78BFA" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Parent's Phone Number"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            keyboardType="phone-pad"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            maxLength={10}
                        />
                    </BlurView>

                    <TouchableOpacity
                        style={styles.inviteButton}
                        activeOpacity={0.8}
                        onPress={handleInvite}
                        disabled={isSubmitting}
                    >
                        <LinearGradient
                            colors={['#34D399', '#059669']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>
                                {isSubmitting ? 'SENDING...' : 'SEND INVITE'}
                            </Text>
                            <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.permissionsContainer}>
                        <Text style={styles.permHeader}>PERMISSIONS THEY GET:</Text>
                        <View style={styles.permItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#34D399" />
                            <Text style={styles.permText}>View Live Location</Text>
                        </View>
                        <View style={styles.permItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#34D399" />
                            <Text style={styles.permText}>Receive Emergency Alerts</Text>
                        </View>
                        <View style={styles.permItem}>
                            <Ionicons name="close-circle" size={16} color="#F87171" />
                            <Text style={[styles.permText, { color: '#FCA5A5' }]}>Cannot Edit Routes</Text>
                        </View>
                    </View>

                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.3)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#E0E7FF',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 20,
        opacity: 0.8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 55,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
    },
    inviteButton: {
        width: '100%',
        height: 55,
        borderRadius: 30,
        shadowColor: "#34D399",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        marginBottom: 40,
    },
    gradientButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    permissionsContainer: {
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 16,
        padding: 20,
    },
    permHeader: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 10,
    },
    permItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    permText: {
        color: '#D1D5DB',
        fontSize: 13,
        marginLeft: 10,
    }
});
