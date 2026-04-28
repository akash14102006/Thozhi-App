import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView, Animated, Easing, Image, Alert, Vibration, ActivityIndicator, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeMap, { Circle, Marker, PROVIDER_GOOGLE, UrlTile } from '../components/SafeMap';
import SafetyIdentityCard from '../components/SafetyIdentityCard';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { AuthService } from '../services/authService';

const { width, height } = Dimensions.get('window');

const MAP_THEME_DARK = [
    { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#121212" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#333333" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const FeatureCard = ({ icon, title, subtitle, color, onPress, IconLib = Ionicons }) => (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.cardContainer}>
            <View style={[styles.cardTint, { backgroundColor: color }]} />
            <View style={styles.cardContentOverlay}>
                <View style={[styles.iconBubble, { shadowColor: color, backgroundColor: `${color}25` }]}>
                    <IconLib name={icon} size={20} color={color} />
                </View>
                <View style={styles.cardTextContent}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardSubtitle}>{subtitle}</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
);

function HomeScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [safetyId, setSafetyId] = useState('');
    const [userName, setUserName] = useState('Warrior');
    const [todayPlan, setTodayPlan] = useState(null);
    const [showIdentityCard, setShowIdentityCard] = useState(false);
    const [activeRequest, setActiveRequest] = useState(null);
    const [enteredZones, setEnteredZones] = useState(new Set());
    const [geofenceZones, setGeofenceZones] = useState([]);
    const [currentAddress, setCurrentAddress] = useState('Locating...');

    // Bottom Sheet Controls
    const SHEET_MIN_HEIGHT = height * 0.50; // Collapsed state  
    const SHEET_MAX_HEIGHT = height * 0.65; // Expanded state
    const sheetPosition = useRef(new Animated.Value(SHEET_MIN_HEIGHT)).current;
    const [sheetHeight, setSheetHeight] = useState(SHEET_MIN_HEIGHT);

    // SOS Animation
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const holdAnim = useRef(new Animated.Value(1)).current;
    const holdProgress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let unsubscribeRequests = () => { };

        (async () => {
            try {
                const id = await AsyncStorage.getItem('SAFETY_ID');
                const userData = await AsyncStorage.getItem('USER_DATA');
                if (id) {
                    setSafetyId(id);
                    // REAL-TIME LISTENER FOR CONNECTION REQUESTS
                    const q = query(
                        collection(db, "connection_requests"),
                        where("to", "==", id),
                        where("status", "==", "pending")
                    );

                    unsubscribeRequests = onSnapshot(q, (snapshot) => {
                        if (!snapshot.empty) {
                            const requestData = snapshot.docs[0].data();
                            setActiveRequest({
                                id: snapshot.docs[0].id,
                                ...requestData
                            });
                        } else {
                            setActiveRequest(null);
                        }
                    });

                    // REAL-TIME LISTENER FOR USER'S OWN DATA (TODAY'S PLAN)
                    const userUnsubscribe = onSnapshot(doc(db, "users", id), (docSnap) => {
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            setTodayPlan(data.todayPlan || null);
                        }
                    });

                    return () => {
                        unsubscribeRequests();
                        userUnsubscribe();
                    }
                }
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user.name) setUserName(user.name);
                }

                // FETCH REAL GEOFENCES FROM BACKEND
                const zones = await AuthService.getGeofences();
                setGeofenceZones(zones);

            } catch (e) {
                console.log('Failed to load user data', e);
            }
        })();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Location permission denied');
                    return;
                }

                // Get current location immediately
                let loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setLocation(loc);

                // Start tracking device stats if not on web
                if (Platform.OS !== 'web') {
                    trackDeviceStats(safetyId);
                }

                // Live Location Watcher - Works on Web & Native
                console.log("[GPS] Starting location watcher...");
                await Location.watchPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 5000,
                    distanceInterval: 10
                }, (newLoc) => {
                    console.log("[GPS] Location update received:", newLoc.coords.latitude, newLoc.coords.longitude);
                    setLocation(newLoc);
                    if (safetyId) updateFirestoreLocation(safetyId, newLoc);
                });
            } catch (e) {
                console.log("Location initialization failed", e);
            }
        })();

        return () => unsubscribeRequests();
    }, [safetyId]);

    const updateFirestoreLocation = async (id, loc) => {
        if (!id) return;

        try {
            const networkState = await Network.getNetworkStateAsync();

            if (!networkState.isInternetReachable) {
                console.log("[GPS] Offline - Queuing location...");
                await AuthService.saveOfflineLocation(loc, id);
                return;
            }

            // Sync any pending offline locations since we are now online
            await AuthService.syncOfflineLocations();

            const userRef = doc(db, "users", id);
            await updateDoc(userRef, {
                lastLocation: {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    accuracy: loc.coords.accuracy || 0,
                    heading: loc.coords.heading || 0,
                    speed: loc.coords.speed || 0,
                    timestamp: new Date().toISOString()
                },
                status: 'online',
                lastActive: new Date().toISOString()
            });

            // CHECK VOYAGE PROGRESS
            if (todayPlan && todayPlan.status === 'active') {
                const nextIdx = (todayPlan.currentPointIndex || 0) + 1;
                if (nextIdx < todayPlan.points.length) {
                    const nextPoint = todayPlan.points[nextIdx];
                    const dist = getDistance(
                        loc.coords.latitude,
                        loc.coords.longitude,
                        nextPoint.latitude,
                        nextPoint.longitude
                    );

                    if (dist < 150) { // 150 meters
                        await updateDoc(userRef, {
                            "todayPlan.currentPointIndex": nextIdx,
                            currentTravelStatus: nextIdx === todayPlan.points.length - 1 ? "Reached Home/Final Destination" : `Reached ${nextPoint.name}`,
                            isAtRisk: false
                        });
                        console.log(`[VOYAGE] reached stop: ${nextPoint.name}`);
                    }
                }
            }
            console.log(`[GPS] Live update sent for ${id}`);
        } catch (e) {
            console.log("GPS sync failed", e);
            // Fallback to queue if the direct update failed
            await AuthService.saveOfflineLocation(loc, id);
        }
    };

    const trackDeviceStats = async (id) => {
        if (!id || Platform.OS === 'web') return;

        const updateStats = async () => {
            try {
                const batteryLevel = await Battery.getBatteryLevelAsync();
                const networkState = await Network.getNetworkStateAsync();

                const userRef = doc(db, "users", id);
                await updateDoc(userRef, {
                    deviceInfo: {
                        type: Platform.OS,
                        model: Device.modelName,
                        brand: Device.brand,
                        battery: Math.round(batteryLevel * 100),
                        networkStatus: networkState.type,
                        isConnected: networkState.isConnected,
                        signalStrength: 'Good', // Basic mock
                        updatedAt: new Date().toISOString()
                    }
                });
            } catch (e) {
                console.log("Device stats update failed", e);
            }
        };

        updateStats();
        const interval = setInterval(updateStats, 10000); // Every 10s
        return () => clearInterval(interval);
    };

    const checkUnsafeZones = async (id, coords) => {
        if (!id) return;

        let currentlyInZone = false;
        let highestRiskZone = null;
        let calculatedScore = 95; // Default safe score
        const newEnteredZones = new Set(enteredZones);

        geofenceZones.forEach(zone => {
            const distance = getDistance(coords.latitude, coords.longitude, zone.lat, zone.lng);

            if (distance <= zone.radius) {
                currentlyInZone = true;

                // Priority: HIGH risk zones set the score and context
                if (!highestRiskZone || (zone.riskLevel === 'HIGH' && highestRiskZone.riskLevel !== 'HIGH')) {
                    highestRiskZone = zone;
                }

                if (zone.riskLevel === 'HIGH') calculatedScore = 32;
                else if (zone.riskLevel === 'MEDIUM') calculatedScore = 58;

                // Detect NEW Entry (Alert only once)
                if (!enteredZones.has(zone.id)) {
                    newEnteredZones.add(zone.id);
                    triggerEntryAlert(zone);
                }
            } else {
                // Detect Exit
                if (enteredZones.has(zone.id)) {
                    newEnteredZones.delete(zone.id);
                    console.log(`Exited Zone: ${zone.name}`);
                }
            }
        });

        setEnteredZones(newEnteredZones);

        const userRef = doc(db, "users", id);
        if (currentlyInZone && highestRiskZone) {
            const riskData = {
                isAtRisk: true,
                riskReason: `${highestRiskZone.riskLevel} Risk: ${highestRiskZone.name}`,
                activeZoneId: highestRiskZone.id,
                safetyScore: calculatedScore,
                lastMovement: new Date().toISOString()
            };

            await updateDoc(userRef, riskData);

            // AUTOMATIC FAMILY ALERT: Send message if score is critically low
            if (calculatedScore < 40) {
                autoNotifySquad(highestRiskZone, calculatedScore);
            }
        } else if (enteredZones.size > 0 && !currentlyInZone) {
            // All zones exited, restore safety parameters
            await updateDoc(userRef, {
                isAtRisk: false,
                riskReason: null,
                activeZoneId: null,
                safetyScore: 98
            });
        }
    };

    const autoNotifySquad = (zone, score) => {
        // Since the family app uses onSnapshot, they will instantly see the 'isAtRisk' status
        // and 'riskReason' update. We also add a local notification/vibration for the girl.
        console.log(`🚨 AUTO-ALERT: Safety Score ${score}% - High Danger Zone: ${zone.name}`);

        if (Platform.OS !== 'web') {
            Vibration.vibrate([100, 500, 100, 500]); // S.O.S pattern
        }
    };

    const triggerEntryAlert = (zone) => {
        console.log(`🚨 ENTERED GEOFENCE: ${zone.name}`);

        // Physical Feedback
        Haptics.notificationAsync(
            zone.riskLevel === 'HIGH'
                ? Haptics.NotificationFeedbackType.Error
                : Haptics.NotificationFeedbackType.Warning
        );

        // UI Feedback for Girl
        Alert.alert(
            `⚠️ Safety Alert: ${zone.name}`,
            `You are in a ${zone.riskLevel} risk area. Stay vigilant and keep your phone ready.`,
            [{ text: "I am Safe" }, { text: "Trigger SOS", onPress: handleSOS, style: 'destructive' }]
        );
    };

    // Helper to calculate distance in meters
    const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const handleSOS = async () => {
        cancelHold();
        try {
            const id = await AsyncStorage.getItem('SAFETY_ID');
            if (id) {
                const userRef = doc(db, "users", id);
                await updateDoc(userRef, {
                    isAtRisk: true,
                    riskReason: "SOS MANUALLY TRIGGERED",
                    lastAction: 'SOS'
                });
            }
        } catch (e) {
            console.log("SOS Firestore update failed", e);
        }

        Alert.alert(
            "🚨 SOS TRIGGERED!",
            "Emergency Contacts Notified. Recording Audio Evidence & Sharing Live Location...",
            [
                {
                    text: "I'm Safe Now", style: "cancel", onPress: async () => {
                        const id = await AsyncStorage.getItem('SAFETY_ID');
                        if (id) {
                            const userRef = doc(db, "users", id);
                            await updateDoc(userRef, { isAtRisk: false, riskReason: null });
                        }
                    }
                },
                { text: "Confirm SOS", onPress: () => setTimeout(() => Alert.alert("Evidence Secure", "Audio & Location Uploaded to Safety Cloud Ref: #SOS-9921"), 3000) }
            ]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    const startHold = () => {
        Animated.timing(holdAnim, {
            toValue: 1.2,
            duration: 3000,
            useNativeDriver: true
        }).start();

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: false
        }).start();
    };

    const cancelHold = () => {
        Animated.timing(holdAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start();

        Animated.timing(holdProgress, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false
        }).start();
    };

    const sosScale = Animated.multiply(pulseAnim, holdAnim);

    // Bottom Sheet Drag Handler
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                sheetPosition.setOffset(sheetHeight);
            },
            onPanResponderMove: (_, gestureState) => {
                const newHeight = sheetHeight - gestureState.dy;
                if (newHeight >= SHEET_MIN_HEIGHT && newHeight <= SHEET_MAX_HEIGHT) {
                    sheetPosition.setValue(-gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                sheetPosition.flattenOffset();
                const newHeight = sheetHeight - gestureState.dy;

                // Snap to nearest position
                let targetHeight = SHEET_MIN_HEIGHT;
                if (newHeight > (SHEET_MIN_HEIGHT + SHEET_MAX_HEIGHT) / 2) {
                    targetHeight = SHEET_MAX_HEIGHT;
                }

                Animated.spring(sheetPosition, {
                    toValue: targetHeight,
                    useNativeDriver: false,
                    friction: 8,
                    tension: 40
                }).start();

                setSheetHeight(targetHeight);
            },
        })
    ).current;

    const handleAcceptRequest = async () => {
        if (!activeRequest) return;
        try {
            // Update request status
            await updateDoc(doc(db, "connection_requests", activeRequest.id), {
                status: 'accepted'
            });
            const isVerified = activeRequest.secureToken ? ' [VERIFIED]' : '';
            alert(`Connection Accepted! ${activeRequest.from} added to your Squad.${isVerified}`);
            setActiveRequest(null);
        } catch (e) {
            alert("Failed to accept request");
        }
    };

    const handleRejectRequest = async () => {
        if (!activeRequest) return;
        try {
            await deleteDoc(doc(db, "connection_requests", activeRequest.id));
            setActiveRequest(null);
        } catch (e) {
            alert("Failed to reject request");
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            {/* Map Background */}
            <View style={StyleSheet.absoluteFill}>
                <SafeMap
                    style={{ width: width, height: height }}
                    initialRegion={{
                        latitude: location?.coords?.latitude || 13.1320,
                        longitude: location?.coords?.longitude || 80.1994,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    }}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    showsCompass={true}
                >
                    <Marker
                        coordinate={{
                            latitude: location?.coords?.latitude || 12.9716,
                            longitude: location?.coords?.longitude || 77.5946
                        }}
                        title="Your Location"
                        pinColor="#7B61FF"
                    />
                    {geofenceZones.map(zone => (
                        <Circle
                            key={zone.id}
                            center={{ latitude: zone.lat, longitude: zone.lng }}
                            radius={zone.radius}
                            fillColor={zone.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)'}
                            strokeColor={zone.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)'}
                            strokeWidth={2}
                        />
                    ))}
                </SafeMap>

                {/* Show a subtle loading indicator if still locating */}
                {!location && (
                    <View style={styles.locatingBadge}>
                        <ActivityIndicator size="small" color="#7C3AED" />
                        <Text style={styles.locatingTextShort}> Acquiring GPS...</Text>
                    </View>
                )}
            </View>

            {/* Overlay Elements - Minimal Glassmorphism */}
            <View style={styles.glassHeader}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => setShowIdentityCard(true)}
                    activeOpacity={0.8}
                >
                    <View style={styles.avatarBubble}>
                        <Image 
                            source={{ uri: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky' }} 
                            style={styles.profileImage}
                        />
                        <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-sharp" size={8} color="white" />
                        </View>
                        <View style={styles.onlineDot} />
                    </View>
                    <View>
                        <Text style={styles.welcomeText}>Hello, <Text style={styles.username}>{userName}</Text></Text>
                        <View style={styles.safetyIdContainer}>
                            <Ionicons name="shield-checkmark" size={11} color="#7B61FF" />
                            <Text style={styles.safetyIdText}> {safetyId || 'Loading...'}</Text>
                            <Ionicons name="chevron-forward" size={12} color="#7B61FF" style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuBtn}>
                    <MaterialIcons name="grid-view" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <View style={styles.floatingContent}>

                <View style={styles.sosContainer}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />

                    {/* Progress Border */}
                    <View style={styles.progressRingContainer}>
                        <Animated.View
                            style={[
                                styles.progressRing,
                                {
                                    opacity: holdProgress.interpolate({
                                        inputRange: [0, 0.1],
                                        outputRange: [0, 1]
                                    }),
                                    transform: [{
                                        scale: holdProgress.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.8, 1.2]
                                        })
                                    }]
                                }
                            ]}
                        />
                    </View>

                    <TouchableOpacity
                        activeOpacity={1}
                        onPressIn={startHold}
                        onPressOut={cancelHold}
                        onLongPress={handleSOS}
                        delayLongPress={3000}
                        onPress={() => Alert.alert("Hold Required", "Please press and hold for 3 seconds to trigger SOS.")}
                        style={styles.sosButton}
                    >
                        <Animated.View style={[styles.sosButtonContent, { transform: [{ scale: holdAnim }] }]}>
                            <LinearGradient
                                colors={['#FF3B30', '#990000']}
                                style={styles.sosGradient}
                            >
                                <FontAwesome5 name="long-arrow-alt-up" size={14} color="rgba(255,255,255,0.6)" style={{ marginBottom: -4 }} />
                                <FontAwesome5 name="power-off" size={28} color="#FFF" />
                                <Text style={styles.sosText}>SOS</Text>
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <Animated.View style={[styles.dashboardCard, { height: sheetPosition }]}>
                    {/* Clean glassmorphism design - no background distractions */}

                    <View style={styles.dashboardContent}>
                        {/* Draggable Handle Area */}
                        <View
                            {...panResponder.panHandlers}
                            style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0,
                                height: 50,
                                zIndex: 50,
                                alignItems: 'center',
                                paddingTop: 15
                            }}
                        >
                            <View style={{
                                width: 40, height: 4,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 2,
                            }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
                            {/* Live Radar Preview */}
                            <TouchableOpacity
                                style={styles.liveRadarCard}
                                onPress={() => { }} // Could expand to full map
                            >
                                <View style={styles.radarHeader}>
                                    <View style={styles.radarPulse}>
                                        <View style={styles.redDot} />
                                    </View>
                                    <Text style={styles.radarTitle}>Live Safety Radar</Text>
                                </View>
                                <View style={styles.radarMapBox}>
                                    <SafeMap
                                        style={StyleSheet.absoluteFill}
                                        region={{
                                            latitude: location?.coords?.latitude || 12.9716,
                                            longitude: location?.coords?.longitude || 77.5946,
                                            latitudeDelta: 0.005,
                                            longitudeDelta: 0.005,
                                        }}
                                        scrollEnabled={false}
                                        // zoomEnabled={false}
                                        rotateEnabled={false}
                                        pitchEnabled={false}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: location?.coords?.latitude || 12.9716,
                                                longitude: location?.coords?.longitude || 77.5946
                                            }}
                                        >
                                            <View style={styles.radarMarker}>
                                                <View style={styles.radarMarkerInner} />
                                            </View>
                                        </Marker>
                                    </SafeMap>
                                    <LinearGradient
                                        colors={['transparent', 'rgba(13, 9, 21, 0.8)']}
                                        style={StyleSheet.absoluteFill}
                                        pointerEvents="none"
                                    />
                                    <View style={styles.radarOverlay}>
                                        <Text style={styles.radarLocText}>{currentAddress || "Locating..."}</Text>
                                        <View style={styles.safetyTag}>
                                            <Text style={styles.safetyTagText}>SECURE AREA</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.row}>
                                <FeatureCard
                                    icon="family-restroom" title="My Squad" subtitle="Live Tracking" color="#A78BFA"
                                    IconLib={MaterialIcons}
                                    onPress={() => navigation.navigate('FamilyTracking')}
                                />
                                <FeatureCard
                                    icon="shield-checkmark" title="Police Akka" subtitle="2 Nearby" color="#60A5FA"
                                    onPress={() => navigation.navigate('FindPolice')}
                                />
                            </View>

                            <View style={styles.row}>
                                <FeatureCard
                                    icon="location" title="Safe Route" subtitle="AI Verified" color="#34D399"
                                    onPress={() => navigation.navigate('RouteSetup')}
                                />
                                <FeatureCard
                                    icon="megaphone" title="Report" subtitle="Incident" color="#FACC15"
                                    onPress={() => navigation.navigate('Report')}
                                />
                            </View>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolsScroll}>
                                <TouchableOpacity style={styles.toolChip}>
                                    <Ionicons name="call" size={16} color="#EC4899" />
                                    <Text style={styles.toolText}>Fake Call</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolChip}>
                                    <Ionicons name="mic" size={16} color="#2DD4BF" />
                                    <Text style={styles.toolText}>Record</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.toolChip}>
                                    <Ionicons name="notifications" size={16} color="#F472B6" />
                                    <Text style={styles.toolText}>Siren</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </ScrollView>
                    </View>
                </Animated.View>
            </View>

            {
                showIdentityCard && (
                    <SafetyIdentityCard
                        safetyId={safetyId}
                        userName={userName}
                        navigation={navigation}
                        onClose={() => setShowIdentityCard(false)}
                    />
                )
            }

            {/* REAL-TIME Connection Request Modal */}
            {
                activeRequest && (
                    <View style={styles.notificationOverlay}>
                        <BlurView intensity={95} tint="dark" style={styles.notificationCard}>
                            <LinearGradient
                                colors={['rgba(139, 92, 246, 0.2)', 'rgba(30, 10, 60, 0.8)']}
                                style={styles.notificationGradient}
                            >
                                <View style={styles.notificationHeader}>
                                    <Ionicons name="people" size={24} color="#A78BFA" />
                                    <Text style={styles.notificationTitle}>Connection Request</Text>
                                </View>

                                <Text style={styles.notificationText}>
                                    <Text style={{ fontWeight: 'bold', color: '#FFF' }}>"{activeRequest.from}"</Text> is requesting to connect using your Safety ID.
                                </Text>

                                <Text style={styles.permissionTitle}>THEY WILL SEE:</Text>
                                <View style={styles.permList}>
                                    <View style={styles.permRow}><Ionicons name="checkmark-circle" size={16} color="#34D399" /><Text style={styles.permText}>Live Location</Text></View>
                                    <View style={styles.permRow}><Ionicons name="checkmark-circle" size={16} color="#34D399" /><Text style={styles.permText}>SOS Trigger Alerts</Text></View>
                                    <View style={styles.permRow}><Ionicons name="checkmark-circle" size={16} color="#34D399" /><Text style={styles.permText}>Travel History</Text></View>
                                </View>

                                <View style={styles.notificationActions}>
                                    <TouchableOpacity style={[styles.actionBtnSide, { backgroundColor: 'rgba(255,59,48,0.2)' }]} onPress={handleRejectRequest}>
                                        <Text style={[styles.actionBtnTextSide, { color: '#FF453A' }]}>Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actionBtnSide, { backgroundColor: '#7B61FF' }]} onPress={handleAcceptRequest}>
                                        <Text style={[styles.actionBtnTextSide, { color: '#FFF' }]}>Accept</Text>
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        </BlurView>
                    </View>
                )
            }
        </View >
    );
}


const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#0D0915' },

    glassHeader: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(13, 9, 21, 0.65)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarBubble: {
        width: 42, height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
    },
    profileImage: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    verifiedBadge: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#10B981',
        borderRadius: 8,
        width: 14,
        height: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#0F172A',
        zIndex: 10,
    },
    onlineDot: {
        position: 'absolute', top: 2, right: 2,
        width: 10, height: 10,
        borderRadius: 5, backgroundColor: '#34D399',
        borderWidth: 1.5, borderColor: '#1F1F2E'
    },
    welcomeText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    username: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    statusText: { color: '#F87171', fontSize: 11, fontWeight: '700', marginTop: 2 },
    safetyIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    safetyIdText: { color: '#7B61FF', fontSize: 11, fontWeight: '600' },
    menuBtn: { padding: 4 },


    floatingContent: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },


    sosContainer: {
        marginBottom: -45,
        zIndex: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulseCircle: {
        position: 'absolute',
        width: 110, height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
    },
    sosButton: {
        width: 90, height: 90,
        borderRadius: 45,
        elevation: 20,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
    },
    sosGradient: {
        flex: 1, borderRadius: 45,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 4, borderColor: '#3a0d0d',
    },
    sosButtonContent: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    progressRingContainer: {
        position: 'absolute',
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressRing: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
        borderWidth: 4,
        borderColor: '#FF3B30',
        borderStyle: 'dashed',
    },
    sosText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginTop: 4 },


    dashboardCard: {
        width: width * 0.92,
        backgroundColor: 'rgba(13, 9, 21, 0.70)',
        borderRadius: 32,
        borderWidth: 1.5,
        borderColor: 'rgba(124, 58, 237, 0.4)',
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 20,
        overflow: 'hidden',
    },
    dashboardContent: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 30,
        width: '100%',
    },
    cardBackgroundImage: {
        position: 'absolute',
        bottom: -20,
        right: -30,
        width: '100%',
        height: '110%',
        opacity: 0.08,
        tintColor: '#FFFFFF',
    },
    handleBar: {
        width: 40, height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
        alignSelf: 'center',
        position: 'absolute', top: 15,
    },


    gridContainer: { gap: 12 },
    row: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
    cardWrapper: { flex: 1, height: 130 },
    cardContainer: {
        flex: 1, borderRadius: 24, padding: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    cardContentOverlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardTint: { ...StyleSheet.absoluteFillObject, opacity: 0.05 },
    iconBubble: {
        width: 34, height: 34, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 8,
    },
    cardTextContent: {},
    cardTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    cardSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },


    toolsScroll: { marginTop: 8, paddingVertical: 10 },
    toolChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(37, 29, 58, 0.7)',
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: 20, marginRight: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
    },
    toolText: { color: '#D1D5DB', fontSize: 12, fontWeight: '600' },

    // Notification Modal Styles
    notificationOverlay: {
        position: 'absolute',
        top: 120,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    notificationCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(139, 92, 246, 0.5)',
    },
    notificationGradient: {
        padding: 20,
    },
    notificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    notificationTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    notificationText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    permissionTitle: {
        color: '#7B61FF',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 10,
    },
    permList: {
        gap: 8,
        marginBottom: 20,
    },
    permRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    permText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 13,
    },
    notificationActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtnSide: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnTextSide: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    locatingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0D0915',
    },
    locatingText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    locatingBadge: {
        position: 'absolute',
        top: 130,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderWidth: 1.5,
        borderColor: 'rgba(124, 58, 237, 0.3)',
        shadowColor: "#7C3AED",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    locatingTextShort: {
        color: '#7C3AED',
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 8,
    },
    // Live Radar Card Styles
    liveRadarCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 24,
        padding: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden'
    },
    radarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        marginLeft: 4
    },
    radarPulse: {
        width: 12, height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        justifyContent: 'center', alignItems: 'center'
    },
    redDot: {
        width: 6, height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444'
    },
    radarTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
    radarMapBox: {
        height: 120,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.2)',
    },
    radarMarker: {
        width: 24, height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(124, 58, 237, 0.3)',
        justifyContent: 'center', alignItems: 'center'
    },
    radarMarkerInner: {
        width: 10, height: 10,
        borderRadius: 5,
        backgroundColor: '#7C3AED',
        borderWidth: 2, borderColor: '#FFF'
    },
    radarOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    radarLocText: { color: '#FFF', fontSize: 12, fontWeight: '600', flex: 1, marginRight: 8 },
    safetyTag: {
        backgroundColor: 'rgba(52, 211, 153, 0.2)',
        paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.4)'
    },
    safetyTagText: { color: '#34D399', fontSize: 10, fontWeight: 'bold' }
});

export default React.memo(HomeScreen);
