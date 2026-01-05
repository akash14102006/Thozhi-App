import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlobalTheme } from '../constants/theme';

export default function GlassButton({ onPress, title, loading, style }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            disabled={loading}
            style={[styles.container, style]}
        >
            <LinearGradient
                colors={GlobalTheme.colors.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={GlobalTheme.colors.textPrimary} />
                ) : (
                    <Text style={styles.text}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: GlobalTheme.colors.buttonAccent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        height: 56,
        width: '100%',
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: GlobalTheme.colors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
