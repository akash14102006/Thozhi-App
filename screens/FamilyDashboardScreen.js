import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from '../components/SafeMap';

const { width, height } = Dimensions.get('window');


const trackedMember = {
    name: "Anu",
    safetyId: "Girl#4821",
    currentLocation: { latitude: 37.78825, longitude: -122.4324 },
    status: "On Route", 
    battery: 78,
    plannedRoute: [
        { latitude: 37.78825, longitude: -122.4324 },
        { latitude: 37.78945, longitude: -122.4310 },
        { latitude: 37.79025, longitude: -122.4295 },
        { latitude: 37.79125, longitude: -122.4280 },
    ],
    destination: { latitude: 37.79125, longitude: -122.4280 },
    estimatedArrival: "12 mins",
    lastUpdate: "Just now"
};

const QuickStatCard = ({ icon, IconLib = Ionicons, label, value, color }) => (
    <View style={styles.statCard}>
        <BlurView intensity={15} tint="dark" style={styles.statBlur}>
            <View style={[styles.statIconBox, { backgroundColor: `${color}20` }]}>
                <IconLib name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
        </BlurView>
    </View>
);

export default function FamilyDashboardScreen({ navigation }) {
    const [memberLocation, setMemberLocation] = useState(trackedMember.currentLocation);
    const [isTracking, setIsTracking] = useState(true);

    
    useEffect(() => {
        if (!isTracking) return;
        
        const interval = setInterval(() => {
            setMemberLocation(prev => ({
                latitude: prev.latitude + 0.0001,
                longitude: prev.longitude + 0.0001
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, [isTracking]);

    const handleRequestHelp = () => {
        alert('🚨 Emergency Request Sent!\nPolice Akka notified.');
    };

    const getStatusColor = () => {
        switch(trackedMember.status) {
            case 'On Route': return '#34D399';
            case 'Deviated': return '#FBBF24';
            case 'Safe at Destination': return '#60A5FA';
            default: return '#FFF';
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: memberLocation.latitude,
                        longitude: memberLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    region={{
                        latitude: memberLocation.latitude,
                        longitude: memberLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    followsUserLocation={false}
                >
                    {}
                    <Polyline
                        coordinates={trackedMember.plannedRoute}
                        strokeColor="#8B5CF6"
                        strokeWidth={4}
                        lineDashPattern={[10, 5]}
                    />
                    
                    {}
                    <Marker coordinate={memberLocation}>
                        <View style={styles.liveMarker}>
                            <View style={styles.markerPulse} />
                            <View style={styles.markerDot} />
                        </View>
                    </Marker>

                    {}
                    <Marker coordinate={trackedMember.destination}>
                        <View style={styles.destinationMarker}>
                            <Ionicons name="flag" size={20} color="#FFF" />
                        </View>
                    </Marker>
                </MapView>

                {}
                <BlurView intensity={40} tint="dark" style={styles.floatingHeader}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.headerTitle}>Tracking {trackedMember.name}</Text>
                            <Text style={styles.headerSubtitle}>{trackedMember.safetyId}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.refreshBtn}>
                        <Ionicons name="refresh" size={20} color="#FFF" />
                    </TouchableOpacity>
                </BlurView>

                {}
                <BlurView intensity={30} tint="dark" style={styles.statusPill}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                    <Text style={styles.statusText}>{trackedMember.status}</Text>
                </BlurView>
            </View>

            {}
            <View style={styles.dashboardSection}>
                <LinearGradient
                    colors={['#1F0A3C', '#2E1065']}
                    style={StyleSheet.absoluteFill}
                />

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {}
                    <View style={styles.statsGrid}>
                        <QuickStatCard 
                            icon="battery-charging" 
                            IconLib={MaterialCommunityIcons}
                            label="Battery" 
                            value={`${trackedMember.battery}%`}
                            color="#34D399"
                        />
                        <QuickStatCard 
                            icon="time-outline" 
                            label="ETA" 
                            value={trackedMember.estimatedArrival}
                            color="#A78BFA"
                        />
                        <QuickStatCard 
                            icon="sync" 
                            IconLib={MaterialIcons}
                            label="Updated" 
                            value={trackedMember.lastUpdate}
                            color="#60A5FA"
                        />
                    </View>

                    {}
                    <View style={styles.journeyCard}>
                        <BlurView intensity={20} tint="dark" style={styles.journeyBlur}>
                            <Text style={styles.sectionTitle}>Current Journey</Text>
                            
                            <View style={styles.journeyRow}>
                                <View style={styles.journeyPoint}>
                                    <View style={[styles.pointDot, { backgroundColor: '#34D399' }]} />
                                    <View style={styles.pointLine} />
                                </View>
                                <View style={styles.journeyDetails}>
                                    <Text style={styles.journeyLabel}>From</Text>
                                    <Text style={styles.journeyLocation}>College Campus</Text>
                                    <Text style={styles.journeyTime}>Started 8 mins ago</Text>
                                </View>
                            </View>

                            <View style={styles.journeyRow}>
                                <View style={styles.journeyPoint}>
                                    <View style={[styles.pointDot, { backgroundColor: '#A78BFA' }]} />
                                </View>
                                <View style={styles.journeyDetails}>
                                    <Text style={styles.journeyLabel}>To</Text>
                                    <Text style={styles.journeyLocation}>Home</Text>
                                    <Text style={styles.journeyTime}>~{trackedMember.estimatedArrival}</Text>
                                </View>
                            </View>
                        </BlurView>
                    </View>

                    {}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.actionBtn}
                            onPress={handleRequestHelp}
                        >
                            <LinearGradient
                                colors={['#EF4444', '#B91C1C']}
                                style={styles.actionBtnGradient}
                            >
                                <Ionicons name="alert-circle" size={24} color="#FFF" />
                                <Text style={styles.actionBtnText}>Request Help</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.actionBtn}
                            onPress={() => alert("Calling...")}
                        >
                            <LinearGradient
                                colors={['#8B5CF6', '#6D28D9']}
                                style={styles.actionBtnGradient}
                            >
                                <Ionicons name="call" size={24} color="#FFF" />
                                <Text style={styles.actionBtnText}>Call {trackedMember.name}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {}
                    <View style={{ height: 20 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0915' },
    
    
    mapContainer: { height: height * 0.55, position: 'relative' },
    map: { width: '100%', height: '100%' },
    
    
    floatingHeader: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    backBtn: { padding: 4 },
    headerTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
    refreshBtn: { padding: 8, backgroundColor: 'rgba(139, 92, 246, 0.3)', borderRadius: 12 },

    
    statusPill: {
        position: 'absolute',
        top: 120,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: { color: '#FFF', fontSize: 13, fontWeight: '600' },

    
    liveMarker: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerPulse: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
    },
    markerDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#8B5CF6',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    destinationMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#34D399',
        justifyContent: 'center',
        alignItems: 'center',
    },

    
    dashboardSection: {
        flex: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        overflow: 'hidden',
        marginTop: -30,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 30,
    },

    
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statBlur: {
        padding: 12,
        alignItems: 'center',
    },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    
    journeyCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    journeyBlur: {
        padding: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    journeyRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    journeyPoint: {
        width: 40,
        alignItems: 'center',
    },
    pointDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    pointLine: {
        width: 2,
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginTop: 4,
        marginBottom: 4,
    },
    journeyDetails: {
        flex: 1,
    },
    journeyLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginBottom: 4,
    },
    journeyLocation: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    journeyTime: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
    },

    
    actionButtons: {
        gap: 12,
    },
    actionBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        gap: 10,
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
