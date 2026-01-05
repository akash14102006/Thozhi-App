import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthService } from '../services/authService';

export default function OtpVerificationScreen({ route, navigation }) {
    const { email, role } = route.params || { email: 'test@example.com', role: 'girl' };
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (otp.length !== 4) {
            alert("Please enter a 4-digit OTP");
            return;
        }

        setIsLoading(true);
        try {
            const result = await AuthService.verifyOtp(email, otp);
            if (result.success) {
                
                navigation.replace('SafetyId', {
                    safetyId: result.safetyId,
                    isNewUser: result.isNewUser,
                    role: role 
                });
            } else {
                alert(result.message || "Verification Failed");
            }
        } catch (error) {
            alert("An error occurred during verification");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <LinearGradient
                colors={['#2e1065', '#4c1d95', '#581c87']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {}
            <View style={styles.glassContainer}>
                <Text style={styles.title}>Verification</Text>
                <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

                {}
                <TextInput
                    style={styles.otpInput}
                    placeholder="0000"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                    textAlign="center"
                    autoFocus
                />

                {}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleVerify}
                    disabled={isLoading}
                    style={{ width: '100%' }}
                >
                    <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        style={styles.btn}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.btnText}>Verify Login</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.resendText}>Wrong email? Go Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassContainer: {
        width: '90%',
        maxWidth: 380,
        padding: 30,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#D8B4FE',
        textAlign: 'center',
        marginBottom: 30,
    },
    otpInput: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 15,
        height: 70,
        width: 200,
        fontSize: 32,
        color: '#FFF',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 30,
        letterSpacing: 10,
        fontWeight: 'bold',
    },
    btn: {
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    btnText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resendText: {
        color: '#A78BFA',
        fontSize: 14,
    },
});
