import React from 'react';
import { TextInput, View, StyleSheet, Text } from 'react-native';
import { GlobalTheme } from '../constants/theme';
import { BlurView } from 'expo-blur';

export default function GlassInput({
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    label,
    icon,
    style
}) {
    return (
        <View style={[styles.wrapper, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.container}>
                <BlurView intensity={12} tint="light" style={StyleSheet.absoluteFill} />
                <View style={styles.contentContainer}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={GlobalTheme.colors.inputPlaceholder}
                        secureTextEntry={secureTextEntry}
                        keyboardType={keyboardType}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        color: GlobalTheme.colors.textPrimary,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 4,
    },
    container: {
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: GlobalTheme.colors.inputBackground,
        height: 56,
        justifyContent: 'center',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: '100%',
    },
    iconContainer: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: GlobalTheme.colors.textPrimary,
        fontSize: 16,
    },
});
