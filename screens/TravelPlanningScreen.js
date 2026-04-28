import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Platform, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import SafeMap, { Marker, Polyline, Circle } from '../components/SafeMap';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

const { width, height } = Dimensions.get('window');

const MAP_THEME_DARK = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
];

export default function TravelPlanningScreen({ navigation }) {
    const [points, setPoints] = useState([]);
    const [region, setRegion] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            let location = await Location.getCurrentPositionAsync({});
            setRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
        })();
    }, []);

    const addPointFromMap = (e) => {
        const coord = e.nativeEvent.coordinate;
        const newPoint = {
            id: Date.now().toString(),
            latitude: coord.latitude,
            longitude: coord.longitude,
            name: points.length === 0 ? "Home" : `Stop ${points.length}`,
            type: points.length === 0 ? 'HOME' : 'STOP',
            status: 'pending'
        };
        setPoints([...points, newPoint]);
    };

    const removePoint = (id) => {
        setPoints(points.filter(p => p.id !== id));
    };

    const handleConfirmPlan = async () => {
        if (points.length < 2) {
            Alert.alert("Plan Incomplete", "Please select at least 2 points (e.g. Home and College).");
            return;
        }

        setIsSaving(true);
        try {
            const safetyId = await AsyncStorage.getItem('SAFETY_ID');
            if (!safetyId) throw new Error("Safety ID not found");

            const plan = {
                points: points,
                createdAt: new Date().toISOString(),
                status: 'active',
                currentPointIndex: 0,
                totalDistance: (points.length * 1.5).toFixed(1), // Mock distance
                estimatedTime: points.length * 20, // Mock time
                safetyLevel: 'Safe'
            };

            await updateDoc(doc(db, "users", safetyId), {
                todayPlan: plan,
                currentTravelStatus: `Headed to ${points[1]?.name || 'next stop'}`
            });

            Alert.alert("Plan Confirmed ✅", "Your travel plan is live. Your family can now track your progress stop-by-stop.", [
                { text: "Continue", onPress: () => navigation.goBack() }
            ]);
        } catch (e) {
            console.log(e);
            Alert.alert("Error", "Failed to save plan. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <SafeMap
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={region}
                onLongPress={addPointFromMap}
            >
                {points.map((p, index) => (
                    <React.Fragment key={p.id}>
                        <Marker coordinate={p}>
                            <View style={styles.markerContainer}>
                                <View style={[styles.nodeCircle, { backgroundColor: index === 0 ? '#10B981' : '#8B5CF6' }]}>
                                    <Text style={styles.nodeText}>{index + 1}</Text>
                                </View>
                            </View>
                        </Marker>
                        {index < points.length - 1 && (
                            <Polyline
                                coordinates={[p, points[index + 1]]}
                                strokeColor="#8B5CF6"
                                strokeWidth={3}
                                lineDashPattern={[5, 5]}
                            />
                        )}
                    </React.Fragment>
                ))}
            </SafeMap>

            {/* Header */}
            <BlurView intensity={80} tint="dark" style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Plan Today's Travel</Text>
                    <Text style={styles.headerSub}>Long press on map to add stops</Text>
                </View>
            </BlurView>

            {/* Bottom Panel */}
            <BlurView intensity={90} tint="dark" style={styles.bottomPanel}>
                <View style={styles.stopsHeader}>
                    <Text style={styles.panelTitle}>Journey Stops ({points.length})</Text>
                    {points.length > 0 && (
                        <TouchableOpacity onPress={() => setPoints([])}>
                            <Text style={styles.clearText}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stopsScroll}>
                    {points.length === 0 ? (
                        <View style={styles.emptyStops}>
                            <Ionicons name="map-outline" size={24} color="rgba(255,255,255,0.3)" />
                            <Text style={styles.emptyText}>Add your first destination</Text>
                        </View>
                    ) : (
                        points.map((p, index) => (
                            <View key={p.id} style={styles.stopCard}>
                                <TouchableOpacity style={styles.removeBtn} onPress={() => removePoint(p.id)}>
                                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                                </TouchableOpacity>
                                <Ionicons
                                    name={index === 0 ? "home" : "location"}
                                    size={20}
                                    color={index === 0 ? "#10B981" : "#8B5CF6"}
                                />
                                <Text style={styles.stopName} numberOfLines={1}>{p.name}</Text>
                            </View>
                        ))
                    )}
                </ScrollView>

                <TouchableOpacity
                    style={[styles.confirmBtn, points.length < 2 && styles.disabledBtn]}
                    onPress={handleConfirmPlan}
                    disabled={isSaving || points.length < 2}
                >
                    <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.btnGradient}>
                        <Text style={styles.btnText}>{isSaving ? 'PLANNING...' : 'CONFIRM TODAY\'S PLAN'}</Text>
                        <Ionicons name="chevron-forward" size={18} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    markerContainer: { alignItems: 'center', justifyContent: 'center' },
    nodeCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
    nodeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    bottomPanel: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 25,
        paddingBottom: 40,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    stopsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    panelTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    clearText: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
    stopsScroll: { marginBottom: 25 },
    stopCard: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        width: 100,
        height: 80,
        borderRadius: 16,
        padding: 12,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    removeBtn: { position: 'absolute', top: -5, right: -5, zIndex: 10 },
    stopName: { color: '#FFF', fontSize: 11, fontWeight: '600', marginTop: 8 },
    emptyStops: { height: 80, justifyContent: 'center', alignItems: 'center', opacity: 0.5, width: width - 50 },
    emptyText: { color: '#FFF', fontSize: 13, marginTop: 5 },
    confirmBtn: { width: '100%', height: 55, borderRadius: 16, overflow: 'hidden' },
    disabledBtn: { opacity: 0.5 },
    btnGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    btnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 },
});
