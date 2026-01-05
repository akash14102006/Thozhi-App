import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import { GlobalTheme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const PermissionRow = ({ icon, title, description }) => (
    <View style={styles.row}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowDesc}>{description}</Text>
        </View>
    </View>
);

export default function PermissionsScreen({ navigation }) {
    return (
        <ScreenWrapper>
            <View style={styles.container}>
                <GlassCard style={styles.card}>
                    <Text style={styles.title}>Permissions Required</Text>

                    <View style={styles.list}>
                        <PermissionRow
                            icon="location-outline"
                            title="Location"
                            description="Find nearby Police Akka"
                        />
                        <PermissionRow
                            icon="mic-outline"
                            title="Microphone"
                            description="Voice & SOS"
                        />
                        <PermissionRow
                            icon="notifications-outline"
                            title="Notifications"
                            description="Emergency alerts"
                        />
                    </View>

                    <GlassButton
                        title="Allow & Continue"
                        onPress={() => navigation.navigate('LoginSuccess')}
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
        paddingVertical: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: GlobalTheme.colors.textPrimary,
        marginBottom: 30,
        textAlign: 'center',
    },
    list: {
        marginBottom: 30,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    rowTitle: {
        color: GlobalTheme.colors.textPrimary,
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    rowDesc: {
        color: GlobalTheme.colors.textSecondary,
        fontSize: 14,
    },
    button: {
        width: '100%',
    }
});
