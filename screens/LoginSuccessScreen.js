import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { GlobalTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function LoginSuccessScreen({ navigation }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true
        }).start();
    }, []);

    const handleHome = () => {
        
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <GlassCard style={styles.card}>
                    <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <Ionicons name="checkmark-circle" size={80} color="#4ADE80" />
                    </Animated.View>

                    <Text style={styles.title}>You're all set!</Text>

                    <Text style={styles.subtitle}>
                        Your safety journey starts now.
                    </Text>

                    <GlassButton
                        title="Go to Home"
                        onPress={handleHome}
                        style={styles.button}
                    />
                </GlassCard>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    card: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    iconContainer: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 50,
        // Making sure the icon background is circular and white behind the green check
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: GlobalTheme.colors.textPrimary,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: GlobalTheme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: 40,
    },
    button: {
        width: '100%',
        marginTop: 20,
    }
});
