import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const AlertCard = ({ alert, onAccept }) => {
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <TouchableOpacity style={styles.alertCard} activeOpacity={0.9}>
            <BlurView intensity={20} tint="dark" style={styles.alertBlur}>
                <View style={styles.alertHeader}>
                    <Animated.View style={[styles.urgentBadge, { transform: [{ scale: pulseAnim }] }]}>
                        <Ionicons name="warning" size={16} color="#FFF" />
                        <Text style={styles.urgentText}>URGENT</Text>
                    </Animated.View>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                </View>

                <Text style={styles.alertId}>{alert.safetyId}</Text>
                <Text style={styles.alertLocation}>{alert.location}</Text>

                <View style={styles.alertDistance}>
                    <Ionicons name="navigate" size={16} color="#60A5FA" />
                    <Text style={styles.distanceText}>{alert.distance} away</Text>
                </View>

                <TouchableOpacity onPress={() => onAccept(alert)} style={styles.acceptBtn}>
                    <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={styles.acceptGradient}>
                        <Text style={styles.acceptText}>Accept & Navigate</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>
        </TouchableOpacity>
    );
};

export default function PoliceHomeScreen({ navigation }) {
    const [isOnDuty, setIsOnDuty] = useState(true);
    const [alerts, setAlerts] = useState([
        { id: 1, safetyId: 'Girl#4821', location: 'Main Street, College Area', distance: '1.2 km', time: '2 mins ago', status: 'active' },
        { id: 2, safetyId: 'Girl#2319', location: 'Park Road, Near Bus Stand', distance: '3.5 km', time: '5 mins ago', status: 'active' },
    ]);

    const handleAccept = (alert) => {
        alert(`Navigating to ${alert.safetyId}\nLocation: ${alert.location}`);
    };

    const handleToggleDuty = () => {
        setIsOnDuty(!isOnDuty);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient colors={['#1F0A3C', '#2E1065']} style={StyleSheet.absoluteFill} />

            {}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="shield-account" size={24} color="#60A5FA" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Police Akka</Text>
                        <Text style={styles.headerSubtitle}>On-Duty Officer</Text>
                    </View>
                </View>

                {}
                <TouchableOpacity onPress={handleToggleDuty} style={styles.dutyToggle}>
                    <View style={[styles.toggleTrack, isOnDuty && styles.toggleTrackActive]}>
                        <View style={[styles.toggleThumb, isOnDuty && styles.toggleThumbActive]} />
                    </View>
                    <Text style={styles.dutyText}>{isOnDuty ? 'On Duty' : 'Off Duty'}</Text>
                </TouchableOpacity>
            </View>

            {}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>2</Text>
                    <Text style={styles.statLabel}>Active Alerts</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>18</Text>
                    <Text style={styles.statLabel}>Resolved Today</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>5.2</Text>
                    <Text style={styles.statLabel}>Avg Response</Text>
                </View>
            </View>

            {}
            <View style={styles.alertsSection}>
                <Text style={styles.sectionTitle}>🚨 Active SOS Alerts</Text>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {alerts.map(alert => (
                        <AlertCard key={alert.id} alert={alert} onAccept={handleAccept} />
                    ))}

                    {alerts.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="checkmark-circle" size={64} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyText}>No Active Alerts</Text>
                            <Text style={styles.emptySubtext}>All clear in your area</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1F0A3C' },

    
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    badge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(96, 165, 250, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#60A5FA',
    },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

    
    dutyToggle: { alignItems: 'center', gap: 8 },
    toggleTrack: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 2,
        justifyContent: 'center',
    },
    toggleTrackActive: { backgroundColor: '#34D399' },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFF',
    },
    toggleThumbActive: { alignSelf: 'flex-end' },
    dutyText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    statValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },

    
    alertsSection: { flex: 1, paddingHorizontal: 20 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    scrollContent: { paddingBottom: 20 },

    
    alertCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#EF4444',
    },
    alertBlur: { padding: 16 },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    urgentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#EF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    urgentText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    alertTime: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    alertId: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    alertLocation: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 12 },
    alertDistance: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    distanceText: { color: '#60A5FA', fontSize: 14, fontWeight: '600' },

    
    acceptBtn: { borderRadius: 12, overflow: 'hidden' },
    acceptGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        gap: 8,
    },
    acceptText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginTop: 16 },
    emptySubtext: { color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 8 },
});
