import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import MapView, { Marker, Polyline } from '../components/SafeMap';

const { width, height } = Dimensions.get('window');


const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
];

export default function ParentDashboardScreen({ navigation }) {
    
    const [girlLocation, setGirlLocation] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
    });
    const [status, setStatus] = useState('ON_ROUTE'); 
    const [lastUpdate, setLastUpdate] = useState('Just now');
    const [battery, setBattery] = useState(85);

    
    const routeCoordinates = [
        { latitude: 37.78825, longitude: -122.4324 },
        { latitude: 37.78925, longitude: -122.4344 }, 
        { latitude: 37.79125, longitude: -122.4364 },
        { latitude: 37.79325, longitude: -122.4384 }, 
    ];

    
    useEffect(() => {
        let step = 0;
        const interval = setInterval(() => {
            step = (step + 1) % routeCoordinates.length;
            setGirlLocation(routeCoordinates[step]);

            
            if (step % 5 === 0) setBattery(b => Math.max(0, b - 1));

        }, 3000); 

        return () => clearInterval(interval);
    }, []);

    const StatusBadge = ({ status }) => {
        let color = '#34D399'; 
        let text = 'ON ROUTE';
        let icon = 'shield-checkmark';

        if (status === 'DEVIATED') {
            color = '#FBBF24'; 
            text = 'ROUTE DEVIATION';
            icon = 'warning';
        } else if (status === 'STOPPED') {
            color = '#F87171'; 
            text = 'UNEXPECTED STOP';
            icon = 'alert-circle';
        }

        return (
            <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}50` }]}>
                <Ionicons name={icon} size={16} color={color} style={{ marginRight: 6 }} />
                <Text style={[styles.badgeText, { color }]}>{text}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Monitoring: Jennifer</Text>
                        <Text style={styles.headerSub}>Live Tracking Active</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                        <Ionicons name="call" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {}
            <MapView
                style={styles.map}
                customMapStyle={mapStyle}
                region={{
                    ...girlLocation,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
            >
                {}
                <Polyline
                    coordinates={routeCoordinates}
                    strokeColor="#34D399"
                    strokeWidth={4}
                    lineDashPattern={[0]}
                />

                {}
                <Marker coordinate={girlLocation}>
                    <View style={styles.markerContainer}>
                        <View style={styles.markerRing}>
                            <View style={styles.markerDot} />
                        </View>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={20} color="#FFF" />
                        </View>
                    </View>
                </Marker>

                {}
                <Marker coordinate={routeCoordinates[routeCoordinates.length - 1]}>
                    <View style={styles.destMarker}>
                        <Ionicons name="flag" size={16} color="#111" />
                    </View>
                </Marker>

            </MapView>

            {}
            <BlurView intensity={30} tint="dark" style={styles.bottomPanel}>
                <View style={styles.panelHandle} />

                <View style={styles.statusRow}>
                    <StatusBadge status={status} />
                    <View style={styles.batteryContainer}>
                        <Ionicons name="battery-charging" size={14} color="#FFF" />
                        <Text style={styles.batteryText}>{battery}%</Text>
                    </View>
                </View>

                <Text style={styles.routeInfo}>Home ➔ College (Morning Route)</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Last Update</Text>
                        <Text style={styles.statValue}>{lastUpdate}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Est. Arrival</Text>
                        <Text style={styles.statValue}>10:45 AM</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Distance</Text>
                        <Text style={styles.statValue}>2.4 km</Text>
                    </View>
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.alertButton}>
                        <Text style={styles.alertButtonText}>REQUEST STATUS</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.alertButton, styles.dangerButton]}>
                        <Text style={styles.alertButtonText}>EMERGENCY ALERT</Text>
                    </TouchableOpacity>
                </View>

            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    map: {
        width: width,
        height: height,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 120,
        zIndex: 10,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerSub: {
        color: '#34D399',
        fontSize: 12,
        fontWeight: '600',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    callButton: {
        padding: 10,
        backgroundColor: '#10B981',
        borderRadius: 25,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
    },
    markerRing: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(52, 211, 153, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(52, 211, 153, 0.5)',
    },
    avatarContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#059669',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    destMarker: {
        padding: 8,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#111',
    },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        backgroundColor: 'rgba(20, 20, 30, 0.85)',
        padding: 25,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    panelHandle: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    batteryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    batteryText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    routeInfo: {
        color: '#E0E7FF',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 16,
        padding: 15,
        marginBottom: 25,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        marginBottom: 4,
    },
    statValue: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    statDivider: {
        width: 1,
        height: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    alertButton: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    dangerButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        marginRight: 0,
        marginLeft: 10,
    },
    alertButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
