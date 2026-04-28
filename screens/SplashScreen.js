import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem('USER_DATA');
                if (userDataJson) {
                    const userData = JSON.parse(userDataJson);
                    console.log("[Splash] Found stored user:", userData.role);

                    // Allow splash to show for at least 2 seconds for branding
                    setTimeout(() => {
                        if (userData.role === 'girl') {
                            navigation.replace('Home');
                        } else if (userData.role === 'family' || userData.role === 'parent') {
                            navigation.replace('ParentDashboard');
                        } else if (userData.role === 'police') {
                            navigation.replace('PoliceHome');
                        } else {
                            navigation.replace('RoleSelection');
                        }
                    }, 2000);
                } else {
                    // No user found, proceed to onboarding after 3s
                    setTimeout(() => {
                        navigation.replace('Onboarding');
                    }, 3000);
                }
            } catch (error) {
                console.error("[Splash] Auth check error:", error);
                navigation.replace('Onboarding');
            }
        };

        checkAuth();
    }, [navigation]);

    return (
        <View style={{ flex: 1, backgroundColor: '#2e003e', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 24 }}>Initializing Thozhi...</Text>
            <LinearGradient
                colors={['#2e003e', '#3d0052', '#4a0072']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/images/app-logo.png')}
                        style={styles.logo}
                        resizeMode="cover"
                    />
                </View>
                <Text style={styles.appName}>Thozhi</Text>
                <Text style={styles.tagline}>Your safety. Always with you.</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    logoContainer: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    logo: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 48,
        color: '#FFFFFF',
        fontFamily: Platform.select({ ios: 'Didot', android: 'serif' }),
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 5,
        textShadowColor: 'rgba(233, 213, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 18,
        color: '#E9D5FF',
        fontWeight: '500',
        marginTop: 5,
        fontStyle: 'italic',
        textAlign: 'center',
        letterSpacing: 1,
    },
});
