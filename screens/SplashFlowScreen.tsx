import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform, Image } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function SplashFlowScreen({ navigation }) {
    const [animationStage, setAnimationStage] = useState('lottie'); // 'lottie' -> 'main'
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;

    const checkAuthAndNavigate = async () => {
        try {
            const userDataJson = await AsyncStorage.getItem('USER_DATA');
            if (userDataJson) {
                const userData = JSON.parse(userDataJson);
                if (userData.role === 'girl') {
                    navigation.replace('Home');
                } else if (userData.role === 'family' || userData.role === 'parent') {
                    navigation.replace('ParentDashboard');
                } else if (userData.role === 'police') {
                    navigation.replace('PoliceHome');
                } else {
                    navigation.replace('RoleSelection');
                }
            } else {
                navigation.replace('Onboarding');
            }
        } catch (error) {
            console.error("[Splash] Auth check error:", error);
            navigation.replace('Onboarding');
        }
    };

    const handleLottieFinish = () => {
        setAnimationStage('main');
        
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(textFadeAnim, {
                toValue: 1,
                duration: 1200,
                delay: 400,
                useNativeDriver: true,
            })
        ]).start(() => {
            // Wait approximately 3 seconds total from transition
            setTimeout(() => {
                checkAuthAndNavigate();
            }, 2000); 
        });
    };

    return (
        <View style={styles.container}>
            {/* Base Background */}
            <LinearGradient
                colors={['#2D004D', '#1A002E']}
                style={StyleSheet.absoluteFill}
            />

            {animationStage === 'lottie' && (
                <Animated.View style={styles.lottieContainer}>
                    <LottieView
                        source={require('../assets/splash.json')}
                        autoPlay
                        loop={false}
                        onAnimationFinish={handleLottieFinish}
                        style={styles.lottie}
                        speed={1}
                    />
                </Animated.View>
            )}

            {animationStage === 'main' && (
                <Animated.View style={[styles.mainSplashContainer, { opacity: fadeAnim }]}>
                    <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <Image
                            source={require('../assets/images/app-logo.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </Animated.View>

                    <Animated.View style={{ opacity: textFadeAnim, alignItems: 'center' }}>
                        <Text style={styles.appName}>Thozhi</Text>
                        <Text style={styles.tagline}>Strength in your pocket..!!</Text>
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2D004D',
    },
    lottieContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottie: {
        width: width * 0.7,
        height: width * 0.7,
    },
    mainSplashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: width * 0.45,
        height: width * 0.45,
        borderRadius: (width * 0.45) / 2,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 15,
        shadowColor: '#E9D5FF', // Subtle glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 52,
        color: '#FFFFFF',
        fontFamily: Platform.select({ ios: 'Didot', android: 'serif' }),
        fontWeight: 'bold',
        marginBottom: 8,
        textShadowColor: 'rgba(233, 213, 255, 0.6)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 18,
        color: '#E9D5FF',
        fontWeight: '500',
        fontStyle: 'italic',
        letterSpacing: 1,
    },
});
