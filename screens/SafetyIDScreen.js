import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SafetyIdScreen({ route, navigation }) {
    const { safetyId, isNewUser, role } = route.params || { safetyId: 'Girl#????', isNewUser: false, role: 'girl' };

    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    const handleContinue = () => {
        
        switch (role) {
            case 'girl':
                navigation.replace('Home');
                break;
            case 'family':
                navigation.replace('FamilyDashboard');
                break;
            case 'police':
                navigation.replace('PoliceHome');
                break;
            default:
                navigation.replace('Home');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#2e1065', '#4c1d95', '#581c87']}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.content}>
                <Text style={styles.headerTitle}>
                    {isNewUser ? 'Safety ID Generated!' : 'Welcome Back'}
                </Text>

                <Animated.View style={[styles.idCard, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <Text style={styles.label}>Your Unique Safety ID</Text>
                    <Text style={styles.safetyId}>{safetyId}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>ANONYMOUS & SECURE</Text>
                    </View>
                </Animated.View>

                <Text style={styles.description}>
                    This ID protects your real identity. Use it for SOS, anonymous complaints, and chatting with Police Akka.
                </Text>

                <TouchableOpacity onPress={handleContinue} activeOpacity={0.8} style={{ width: '100%' }}>
                    <LinearGradient
                        colors={['#8B5CF6', '#6D28D9']}
                        style={styles.btn}
                    >
                        <Text style={styles.btnText}>Go to Dashboard</Text>
                    </LinearGradient>
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
    content: {
        width: '100%',
        padding: 30,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 26,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 40,
        textAlign: 'center',
    },
    idCard: {
        width: '100%',
        padding: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center', 
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        marginBottom: 40,
    },
    label: {
        color: '#D8B4FE',
        fontSize: 14,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    safetyId: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
        textShadowColor: 'rgba(139, 92, 246, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    badge: {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    badgeText: {
        color: '#E9D5FF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    description: {
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
        fontSize: 15,
        paddingHorizontal: 10,
    },
    btn: {
        width: '100%',
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 18,
    }
});
