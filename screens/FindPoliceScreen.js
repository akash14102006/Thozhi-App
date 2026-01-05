import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    Image,
    ScrollView,
    Alert,
    FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, Circle } from '../components/SafeMap';
import * as Location from 'expo-location';
import { AuthService } from '../services/authService';

const { width, height } = Dimensions.get('window');

const PoliceCard = ({ officer, onConnect }) => (
    <View style={styles.officerCard}>
        <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
            <View style={styles.cardTop}>
                <Image source={{ uri: officer.image || 'https://i.pravatar.cc/100?u=' + officer.id }} style={styles.officerImage} />
                <View style={styles.officerInfo}>
                    <Text style={styles.officerName}>{officer.name}</Text>
                    <View style={styles.badgeContainer}>
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="shield-checkmark" size={10} color="#FFF" />
                            <Text style={styles.verifiedText}>VERIFIED</Text>
                        </View>
                        <Text style={styles.distanceText}>{officer.distance}</Text>
                    </View>
                </View>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FACC15" />
                    <Text style={styles.ratingText}>{officer.rating}</Text>
                </View>
            </View>

            <View style={styles.cardBottom}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: officer.status === 'active' ? '#10B981' : '#FBBF24' }]} />
                    <Text style={styles.statusText}>{officer.status === 'active' ? 'Active Patrolling' : 'Busy'}</Text>
                </View>
                <TouchableOpacity style={styles.connectBtn} onPress={() => onConnect(officer)}>
                    <LinearGradient
                        colors={['#7C3AED', '#4C1D95']}
                        style={styles.connectGradient}
                    >
                        <Text style={styles.connectText}>Request Assist</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </BlurView>
    </View>
);

export default function FindPoliceScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [nearbyPolice, setNearbyPolice] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);

                
                const officers = await AuthService.findNearbyPolice(loc.coords);
                setNearbyPolice(officers);
            }
            setIsLoading(false);
        })();
    }, []);

    const handleConnect = (officer) => {
        Alert.alert(
            "Request Assistance",
            `Do you want to share your live location with ${officer.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Share & Notify",
                    onPress: async () => {
                        const result = await AuthService.requestPoliceAssistance(officer.id, location.coords);
                        if (result.success) {
                            Alert.alert("Request Sent", result.message);
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <View style={styles.mapWrapper}>
                {location ? (
                    <MapView
                        style={StyleSheet.absoluteFill}
                        initialRegion={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        }}
                    >
                        <Circle
                            center={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            radius={500}
                            fillColor="rgba(124, 58, 237, 0.1)"
                            strokeColor="rgba(124, 58, 237, 0.3)"
                        />

                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                        >
                            <View style={styles.userMarker}>
                                <View style={styles.userMarkerPulse} />
                                <View style={styles.userMarkerDot} />
                            </View>
                        </Marker>

                        {nearbyPolice.map(officer => (
                            <Marker
                                key={officer.id}
                                coordinate={{
                                    latitude: officer.lat || location.coords.latitude + 0.005,
                                    longitude: officer.lng || location.coords.longitude + 0.005,
                                }}
                                title={officer.name}
                            >
                                <View style={styles.policeMarker}>
                                    <View style={styles.policeIconContainer}>
                                        <MaterialCommunityIcons name="shield-account" size={20} color="#FFF" />
                                    </View>
                                    <View style={styles.policeMarkerPointer} />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                ) : (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Locating nearby Police Akka...</Text>
                    </View>
                )}

                <LinearGradient
                    colors={['rgba(13, 9, 21, 0.7)', 'transparent', 'transparent', '#0D0915']}
                    style={StyleSheet.absoluteFill}
                    pointerEvents="none"
                />
            </View>

            {}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <BlurView intensity={30} tint="dark" style={styles.backButtonBlur}>
                    <Ionicons name="arrow-back" size={24} color="#FFF" />
                </BlurView>
            </TouchableOpacity>

            {}
            <View style={styles.bottomContent}>
                <View style={styles.handleBar} />
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Police Akka Nearby</Text>
                        <Text style={styles.subtitle}>{nearbyPolice.length} officers patrolling in your area</Text>
                    </View>
                    <TouchableOpacity style={styles.sosButton} onPress={() => Alert.alert("Emergency SOS", "Notifying all nearby officers!")}>
                        <LinearGradient colors={['#EF4444', '#991B1B']} style={styles.sosGradient}>
                            <Text style={styles.sosText}>SOS</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={nearbyPolice}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PoliceCard officer={item} onConnect={handleConnect} />
                    )}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0915' },
    mapWrapper: { height: height * 0.6, width: '100%' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#7C3AED', fontSize: 16, fontWeight: '600' },

    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 100,
    },
    backButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },

    bottomContent: {
        flex: 1,
        backgroundColor: '#0D0915',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        marginTop: -30,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 },

    sosButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        elevation: 10,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    sosGradient: {
        flex: 1,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sosText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

    listContent: { paddingBottom: 40 },
    officerCard: {
        marginBottom: 16,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    cardBlur: { padding: 16 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    officerImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#7C3AED' },
    officerInfo: { flex: 1, marginLeft: 12 },
    officerName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C3AED',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        gap: 3,
    },
    verifiedText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
    distanceText: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
    ratingContainer: { alignItems: 'center' },
    ratingText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginTop: 2 },

    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    statusRow: { flexDirection: 'row', alignItems: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusText: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
    connectBtn: { width: 120, height: 36, borderRadius: 18, overflow: 'hidden' },
    connectGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    connectText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    
    userMarker: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    userMarkerPulse: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
    },
    userMarkerDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#7C3AED',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    policeMarker: { alignItems: 'center' },
    policeIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1E40AF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        elevation: 5,
    },
    policeMarkerPointer: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#FFF',
        marginTop: -1,
    }
});
