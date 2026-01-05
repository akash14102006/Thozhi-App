import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from '../components/SafeMap';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');


const mapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
    { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#263c3f" }] },
    { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#6b9a76" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
    { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#746855" }] },
    { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#1f2835" }] },
    { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [{ "color": "#f3d19c" }] },
    { "featureType": "transit", "elementType": "geometry", "stylers": [{ "color": "#2f3948" }] },
    { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] },
    { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#515c6d" }] },
    { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
];

export default function RouteSetupScreen({ navigation }) {
    const [fromLoc, setFromLoc] = useState('');
    const [toLoc, setToLoc] = useState('');
    const [timeOfDay, setTimeOfDay] = useState('Morning');
    const [calculatedRoutes, setCalculatedRoutes] = useState(null);
    const [selectedRouteId, setSelectedRouteId] = useState(null);
    const [region, setRegion] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        })();
    }, []);

    const handleSearch = () => {
        if (!fromLoc || !toLoc) {
            Alert.alert("Missing Info", "Please enter source and destination.");
            return;
        }

        
        
        const mockStart = region ? { latitude: region.latitude, longitude: region.longitude } : { latitude: 37.78825, longitude: -122.4324 };
        const mockEnd = { latitude: mockStart.latitude + 0.02, longitude: mockStart.longitude + 0.02 };

        setCalculatedRoutes([
            {
                id: 1,
                name: "Main Avenue via Market",
                score: 94,
                distance: "5.2 km",
                lighting: "High",
                crowd: "Busy",
                police: "2 Patrols",
                verdict: "SAFEST",
                coordinates: [mockStart, { latitude: mockStart.latitude + 0.01, longitude: mockStart.longitude }, mockEnd]
            },
            {
                id: 2,
                name: "Shortcut via Industrial Area",
                score: 45,
                distance: "3.8 km",
                lighting: "Low",
                crowd: "Isolated",
                police: "None",
                verdict: "UNSAFE",
                coordinates: [mockStart, { latitude: mockStart.latitude, longitude: mockStart.longitude + 0.015 }, mockEnd]
            }
        ]);
        setSelectedRouteId(1);
    };

    const handleSave = () => {
        Alert.alert("Route Saved", "This route is now active for daily monitoring.", [
            { text: "Done", onPress: () => navigation.goBack() }
        ]);
    };

    const renderTimeOption = (label, icon) => (
        <TouchableOpacity
            onPress={() => setTimeOfDay(label)}
            style={[
                styles.timeOption,
                timeOfDay === label && styles.timeOptionActive
            ]}
        >
            <Ionicons
                name={icon}
                size={20}
                color={timeOfDay === label ? '#FFF' : '#A78BFA'}
            />
            <Text style={[styles.timeText, timeOfDay === label && { color: '#FFF' }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#12002B', '#2A0A4E', '#1F2937']}
                style={StyleSheet.absoluteFill}
            />

            {}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Safe Route</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {}
                <View style={styles.card}>
                    <Text style={styles.label}>SOURCE LOCATION</Text>
                    <View style={styles.inputRow}>
                        <Ionicons name="home-outline" size={20} color="#60A5FA" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Home"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={fromLoc}
                            onChangeText={setFromLoc}
                        />
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.label}>DESTINATION</Text>
                    <View style={styles.inputRow}>
                        <Ionicons name="school-outline" size={20} color="#F472B6" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. College / Office"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            value={toLoc}
                            onChangeText={setToLoc}
                        />
                    </View>
                </View>

                {}
                <View style={styles.mapContainer}>
                    {region ? (
                        <MapView
                            style={styles.map}
                            initialRegion={region}
                            customMapStyle={mapStyle}
                            provider="google"
                        >
                            {calculatedRoutes && calculatedRoutes.map(route => (
                                <Polyline
                                    key={route.id}
                                    coordinates={route.coordinates}
                                    strokeColor={selectedRouteId === route.id ? (route.score > 80 ? "#34D399" : "#F87171") : "rgba(255,255,255,0.3)"}
                                    strokeWidth={4}
                                />
                            ))}
                            {calculatedRoutes && selectedRouteId && (
                                <>
                                    <Marker coordinate={calculatedRoutes.find(r => r.id === selectedRouteId).coordinates[0]} title="Start" />
                                    <Marker coordinate={calculatedRoutes.find(r => r.id === selectedRouteId).coordinates[2]} title="End" />
                                </>
                            )}
                        </MapView>
                    ) : (
                        <View style={styles.mapLoading}>
                            <Text style={styles.mapLoadingText}>Loading Map...</Text>
                        </View>
                    )}
                </View>

                {}
                <Text style={styles.sectionLabel}>USUAL TRAVEL TIME</Text>
                <View style={styles.timeSelector}>
                    {renderTimeOption('Morning', 'sunny-outline')}
                    {renderTimeOption('Evening', 'partly-sunny-outline')}
                    {renderTimeOption('Night', 'moon-outline')}
                </View>

                {}
                {!calculatedRoutes && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.8}
                        onPress={handleSearch}
                    >
                        <LinearGradient
                            colors={['#60A5FA', '#3B82F6']}
                            style={styles.gradientButton}
                        >
                            <Text style={styles.buttonText}>CALCULATE SAFEST ROUTE</Text>
                            <Ionicons name="analytics-outline" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {}
                {calculatedRoutes && (
                    <View style={styles.resultsContainer}>
                        <Text style={styles.resultHeader}>AI SAFETY ANALYSIS</Text>

                        {calculatedRoutes.map((route) => {
                            const isSelected = selectedRouteId === route.id;
                            const isSafe = route.score > 80;
                            return (
                                <TouchableOpacity
                                    key={route.id}
                                    onPress={() => setSelectedRouteId(route.id)}
                                    activeOpacity={0.9}
                                    style={[
                                        styles.routeCard,
                                        isSelected && styles.routeCardSelected,
                                        !isSafe && { borderColor: 'rgba(248, 113, 113, 0.3)' }
                                    ]}
                                >
                                    <View style={styles.routeHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.routeName}>{route.name}</Text>
                                            <Text style={styles.routeDetails}>{route.distance} • {route.lighting} Lighting</Text>
                                        </View>
                                        <View style={[styles.scoreBadge, { backgroundColor: isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]}>
                                            <Text style={[styles.scoreText, { color: isSafe ? '#34D399' : '#F87171' }]}>
                                                {route.score}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.tagsRow}>
                                        <View style={styles.tag}><Text style={styles.tagText}>{route.crowd}</Text></View>
                                        {route.police !== "None" && (
                                            <View style={styles.tag}><Text style={styles.tagText}>{route.police}</Text></View>
                                        )}
                                    </View>

                                    {isSafe ? (
                                        <Text style={styles.verdictSafe}>RECOMMENDED SAFETY ROUTE</Text>
                                    ) : (
                                        <Text style={styles.verdictUnsafe}>⚠️ High Risk of Harassment</Text>
                                    )}

                                    {isSelected && (
                                        <View style={styles.checkIcon}>
                                            <Ionicons name="checkmark-circle" size={24} color={isSafe ? "#34D399" : "#F87171"} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}

                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: 20 }]}
                            activeOpacity={0.8}
                            onPress={handleSave}
                        >
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.buttonText}>CONFIRM & SAVE ROUTE</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                    </View>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 50 : 60,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 25,
    },
    label: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFF',
        fontSize: 16,
        paddingVertical: 4,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 15,
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    mapLoadingText: {
        color: '#FFF',
    },
    sectionLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 4,
    },
    timeSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    timeOption: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        marginHorizontal: 4,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    timeOptionActive: {
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
        borderColor: '#8B5CF6',
    },
    timeText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 6,
        fontWeight: '600',
    },
    actionButton: {
        height: 55,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    gradientButton: {
        flex: 1,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    resultsContainer: {
        marginTop: 10,
    },
    resultHeader: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    routeCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.6)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    routeCardSelected: {
        borderColor: '#34D399',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
    },
    routeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    routeName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    routeDetails: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginTop: 4,
    },
    scoreBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        minWidth: 40,
        alignItems: 'center',
    },
    scoreText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    tagsRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    tag: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginRight: 8,
    },
    tagText: {
        color: '#D1D5DB',
        fontSize: 11,
    },
    verdictSafe: {
        color: '#34D399',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    verdictUnsafe: {
        color: '#F87171',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    checkIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    }
});
