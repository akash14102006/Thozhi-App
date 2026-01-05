import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlobalTheme } from '../constants/theme';

export default function GlassCard({ children, style }) {
    const translateY = useRef(new Animated.Value(50)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <Animated.View style={[styles.container, style, { opacity, transform: [{ translateY }] }]}>
            <BlurView intensity={20} tint="light" style={styles.blur}>
                <View style={styles.content}>
                    {children}
                </View>
            </BlurView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: GlobalTheme.glassCard.borderRadius,
        borderColor: GlobalTheme.glassCard.borderColor,
        borderWidth: GlobalTheme.glassCard.borderWidth,
        backgroundColor: GlobalTheme.glassCard.backgroundColor,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 32,
        elevation: 8,
    },
    blur: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 20,
        width: '100%',
    },
});
