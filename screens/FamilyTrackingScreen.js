import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Platform,
    Image,
    ScrollView,
    TextInput,
    Modal,
    Share,
    Linking,
    Alert,
    Animated as RNAnimated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import SafeMap, { Marker, Polyline, Circle, PROVIDER_GOOGLE, UrlTile } from '../components/SafeMap';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    FadeInUp,
    FadeInDown,
} from 'react-native-reanimated';
import Svg, { Circle as SvgCircle, G } from 'react-native-svg';
import QRCode from 'react-native-qrcode-svg';

const { width, height } = Dimensions.get('window');

const SAFETY_SCORE = 92;
import { AuthService } from '../services/authService';
const MAP_THEME_DARK = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
];




const SafetyScoreRing = ({ score }) => {
    const size = 60;
    const strokeWidth = 5;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = score / 100;
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={styles.scoreContainer}>
            <Svg width={size} height={size}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
                    <SvgCircle cx={size / 2} cy={size / 2} r={radius} stroke={score > 80 ? "#10B981" : score > 50 ? "#F59E0B" : "#EF4444"} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </G>
            </Svg>
            <View style={styles.scoreTextContainer}>
                <Text style={styles.scoreValue}>{score}</Text>
                <Text style={styles.scoreLabel}>SAFE</Text>
            </View>
        </View>
    );
};


const PulsingMarker = ({ image, heading }) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.6);

    useEffect(() => {
        scale.value = withRepeat(withTiming(2.8, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false);
        opacity.value = withRepeat(withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }), -1, false);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value, }));

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View style={[animatedStyle, { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(16, 185, 129, 0.4)', position: 'absolute' }]} />
            <View style={[styles.markerCore, heading ? { transform: [{ rotate: `${heading}deg` }] } : {}]}>
                {heading && (
                    <View style={styles.directionArrow}>
                        <Ionicons name="caret-up" size={12} color="#10B981" />
                    </View>
                )}
                <View style={styles.imageClip}>
                    <Image
                        source={{ uri: image || 'https://img.freepik.com/free-photo/portrait-young-indian-woman-happy-smiling_231208-2519.jpg' }}
                        style={styles.markerImage}
                    />
                </View>
                <View style={styles.onlineBadge} />
            </View>
        </View>
    );
};


const SquadAvatar = ({ image, status }) => (
    <View style={styles.squadAvatarContainer}>
        <Image source={{ uri: image }} style={styles.squadImage} />
        <View style={[styles.squadStatus, { backgroundColor: status === 'active' ? '#10B981' : '#6B7280' }]} />
    </View>
);

export default function FamilyTrackingScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('status');
    const [girlData, setGirlData] = useState(null);
    const [isNavigating, setIsNavigating] = useState(false);
    const [lastLoc, setLastLoc] = useState(null);
    const [userLoc, setUserLoc] = useState(null);
    const [geofenceZones, setGeofenceZones] = useState([]);
    const [destination, setDestination] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [qrSession, setQrSession] = useState('');
    const [timeLeft, setTimeLeft] = useState(600);
    const [currentAddress, setCurrentAddress] = useState('Locating...');
    const [routeHistory, setRouteHistory] = useState([]);
    const [sheetCollapsed, setSheetCollapsed] = useState(true);
    const mapRef = useRef(null);
    const sheetAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        RNAnimated.spring(sheetAnim, {
            toValue: sheetCollapsed ? 0 : 1,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();
    }, [sheetCollapsed]);

    const toggleSheet = () => setSheetCollapsed(!sheetCollapsed);

    const handleAddressUpdate = async (coords) => {
        if (!coords) return;
        try {
            const result = await Location.reverseGeocodeAsync({
                latitude: coords.latitude,
                longitude: coords.longitude
            });
            if (result && result.length > 0) {
                const addr = result[0];
                const cleanAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`;
                setCurrentAddress(cleanAddr.trim() || 'Active Location');
            }
        } catch (e) {
            console.log("Geocoding failed", e);
        }
    };

    useEffect(() => {
        let timer;
        if (showQRModal) {
            // Generate new token on open
            const generateToken = async () => {
                const random = Math.random().toString(36).substring(7).toUpperCase();
                setQrSession(random);
                setTimeLeft(600);

                // Sync this token to the girl's profile so new recruits can be verified
                const id = girlData?.safetyId;
                if (id) {
                    try {
                        const q = query(collection(db, "users"), where("safetyId", "==", id));
                        const snapshot = await getDocs(q);
                        if (!snapshot.empty) {
                            await updateDoc(snapshot.docs[0].ref, {
                                currentSecureToken: random,
                                tokenGeneratedAt: new Date().toISOString()
                            });
                        }
                    } catch (e) { console.log("Token sync failed", e); }
                }
            };

            generateToken();

            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        generateToken();
                        return 600;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [showQRModal]);

    useEffect(() => {
        let unsubscribe = () => { };

        const initTracking = async () => {
            try {
                const zones = await AuthService.getGeofences();
                setGeofenceZones(zones);

                // Request permissions for current user location
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const current = await Location.getCurrentPositionAsync({});
                    setUserLoc(current.coords);
                }

                const storedGirlId = await AsyncStorage.getItem('TRACKING_GIRL_ID') || 'THOZHI-IL939V';

                const q = query(collection(db, "users"), where("safetyId", "==", storedGirlId));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    if (!snapshot.empty) {
                        const data = snapshot.docs[0].data();
                        setGirlData(data);
                        if (data.lastLocation) {
                            const newLoc = data.lastLocation;
                            setLastLoc(newLoc);
                            handleAddressUpdate(newLoc);

                            // Update route history
                            setRouteHistory(prev => {
                                const newPath = [...prev, {
                                    latitude: newLoc.latitude,
                                    longitude: newLoc.longitude
                                }];
                                // Prevent duplicate points and limit history
                                if (prev.length > 0) {
                                    const last = prev[prev.length - 1];
                                    if (last.latitude === newLoc.latitude && last.longitude === newLoc.longitude) return prev;
                                }
                                return newPath.slice(-50); // Keep last 50 points
                            });

                            // Smoothly animate map to new location
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    latitude: newLoc.latitude,
                                    longitude: newLoc.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }, 1000);
                            }
                        }
                        if (data.isAtRisk) {
                            triggerRiskAlert(data.riskReason);
                        }
                    }
                    setLoading(false);
                });
            } catch (e) {
                console.log("Tracking init failed", e);
                setLoading(false);
            }
        };

        initTracking();
        return () => unsubscribe();
    }, []);

    // Auto-center map on first location fix
    useEffect(() => {
        if (lastLoc && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: lastLoc.latitude,
                longitude: lastLoc.longitude,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
            }, 1000);
        }
    }, [lastLoc ? 'fixed' : 'none']);

    const triggerRiskAlert = (reason) => {
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleStartNavigation = () => {
        setIsNavigating(true);
        Alert.alert("Navigation Started", `Monitoring route for ${girlData?.name || 'Warrior'}`);
    };

    const handleShareID = async () => {
        const id = girlData?.safetyId || 'THOZHI-IL939V';
        const message = `🛡️ *THOZHI SECURE SQUAD* 🛡️\n\nHelp me protect *${girlData?.name || 'my warrior'}*. join our circle now!\n\nSafety ID: *${id}*\nSecure Token: *${qrSession}*\n\n⚠️ *Valid for only 10 minutes!* ⏳\n\n📲 Download Thozhi App to track live.`;

        try {
            await Share.share({
                message: message,
            });
        } catch (error) {
            console.log('Error sharing:', error);
        }
    };

    const handleSocialShare = (platform) => {
        const id = girlData?.safetyId || 'THOZHI-IL939V';
        const message = encodeURIComponent(`🛡️ *THOZHI SECURE SQUAD* 🛡️\n\nI'm tracking ${girlData?.name || 'my warrior'}. Join now!\n\nID: *${id}*\nToken: *${qrSession}*\n\n⏳ *Expired in 10 mins!*`);

        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `whatsapp://send?text=${message}`;
                break;
            case 'instagram':
                url = `instagram://camera`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=https://thozhi-app.com&quote=${message}`;
                break;
        }

        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    if (platform === 'whatsapp') {
                        Linking.openURL(`https://wa.me/?text=${message}`);
                    } else if (platform === 'facebook') {
                        Linking.openURL(url);
                    } else {
                        Alert.alert("Notice", "App is not installed on this device.");
                    }
                }
            });
        }
    };

    const recenterOnUser = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({});
        mapRef.current?.animateToRegion({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    };

    const recenterOnGirl = () => {
        if (!lastLoc) return;
        mapRef.current?.animateToRegion({
            latitude: lastLoc.latitude,
            longitude: lastLoc.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <SafeMap
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                showsUserLocation={true}
                followsUserLocation={false}
                initialRegion={{
                    latitude: lastLoc?.latitude || 12.9716,
                    longitude: lastLoc?.longitude || 77.5946,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
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

                {/* Draw the journey path */}
                {routeHistory.length > 1 && (
                    <Polyline
                        coordinates={routeHistory}
                        strokeColor="#8B5CF6"
                        strokeWidth={4}
                        lineDashPattern={[0]}
                    />
                )}

                {lastLoc && (
                    <Marker
                        coordinate={{ latitude: lastLoc.latitude, longitude: lastLoc.longitude }}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <PulsingMarker
                            image={girlData?.photoURL}
                            heading={lastLoc.heading}
                        />
                    </Marker>
                )}

                {/* TODAY'S PLAN VOYAGE (CHAIN NODES) */}
                {girlData?.todayPlan?.points?.map((p, index) => (
                    <React.Fragment key={p.id}>
                        <Marker coordinate={p}>
                            <View style={styles.planNode}>
                                <View style={[styles.nodeCircle, {
                                    backgroundColor: index <= (girlData.todayPlan.currentPointIndex || 0) ? '#10B981' : '#374151',
                                    borderColor: index === (girlData.todayPlan.currentPointIndex || 0) ? '#FFF' : 'rgba(255,255,255,0.2)'
                                }]}>
                                    <Text style={styles.nodeText}>{index + 1}</Text>
                                </View>
                                {index === (girlData.todayPlan.currentPointIndex || 0) && (
                                    <View style={styles.activeTag}>
                                        <Text style={styles.activeTagText}>CURRENT</Text>
                                    </View>
                                )}
                            </View>
                        </Marker>
                        {index < girlData.todayPlan.points.length - 1 && (
                            <Polyline
                                coordinates={[p, girlData.todayPlan.points[index + 1]]}
                                strokeColor="rgba(139, 92, 246, 0.4)"
                                strokeWidth={3}
                                lineDashPattern={[6, 4]}
                            />
                        )}
                    </React.Fragment>
                ))}
            </SafeMap>

            <TouchableOpacity
                activeOpacity={1}
                onPress={() => !sheetCollapsed && setSheetCollapsed(true)}
                style={styles.hudContainer}
            >
                <BlurView intensity={60} tint="dark" style={styles.hudGlass}>
                    <View style={styles.hudTopRow}>
                        <View style={styles.scoreWrapper}>
                            <SafetyScoreRing score={girlData?.isAtRisk ? 32 : (girlData?.safetyScore || 92)} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.hudTitle}>Tracking {girlData?.name || 'Warrior'}</Text>
                                <Text style={[styles.hudSubtitle, girlData?.isAtRisk && { color: '#F87171', fontWeight: 'bold' }]}>
                                    {girlData?.isAtRisk ? `⚠️ AT RISK` : 'Live Status: Active'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.squadContainer}>
                            <View style={styles.avatarRow}>
                                <SquadAvatar
                                    image={girlData?.photoURL || 'https://randomuser.me/api/portraits/men/32.jpg'}
                                    status={girlData?.status || 'active'}
                                />
                                <TouchableOpacity style={styles.addSquadBtn} onPress={() => setShowQRModal(true)}>
                                    <Ionicons name="add" size={16} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </TouchableOpacity>

            {/* LIVE Badge atop Map */}
            <View style={[styles.liveBadgeWrapper, { top: 125 }]}>
                <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE GPS</Text>
                    <View style={styles.vDivider} />
                    <Text style={styles.speedText}>{Math.round(lastLoc?.speed || 0)} km/h</Text>
                </View>
            </View>

            {/* Map Interaction Icons */}
            <View style={[styles.mapControls, { top: 180 }]}>
                <TouchableOpacity style={styles.controlBtn} onPress={recenterOnGirl}>
                    <BlurView intensity={60} tint="dark" style={styles.controlBlur}>
                        <Ionicons name="navigate-circle" size={24} color="#10B981" />
                    </BlurView>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn} onPress={recenterOnUser}>
                    <BlurView intensity={60} tint="dark" style={styles.controlBlur}>
                        <Ionicons name="person-circle" size={24} color="#8B5CF6" />
                    </BlurView>
                </TouchableOpacity>
            </View>

            <RNAnimated.View
                style={[
                    styles.bottomSheetWrapper,
                    {
                        height: sheetAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [140, height * 0.7]
                        })
                    }
                ]}
            >
                <BlurView intensity={90} tint="dark" style={styles.bottomSheet}>
                    <TouchableOpacity style={styles.sheetHandleContainer} onPress={toggleSheet} activeOpacity={0.7}>
                        <View style={styles.sheetHandle} />
                        <Text style={styles.sheetHandleText}>{sheetCollapsed ? 'Swipe up for Details' : 'Swipe down to view Map'}</Text>
                    </TouchableOpacity>

                    {sheetCollapsed ? (
                        <View style={styles.collapsedSheetContent}>
                            <View style={styles.compactAddr}>
                                <Ionicons name="location" size={18} color="#60A5FA" />
                                <Text style={styles.compactAddrText} numberOfLines={1}>{currentAddress || "Locating..."}</Text>
                            </View>
                            <TouchableOpacity style={styles.quickActionBtn} onPress={() => Alert.alert("Emergency Siren Activated")}>
                                <LinearGradient colors={['#EF4444', '#991B1B']} style={styles.quickActionGrad}>
                                    <Ionicons name="notifications" size={18} color="#FFF" />
                                    <Text style={styles.quickActionText}>SIREN</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                            <View style={styles.tabRow}>
                                <TouchableOpacity style={[styles.tab, activeTab === 'status' && styles.activeTab]} onPress={() => setActiveTab('status')}>
                                    <Text style={[styles.tabText, activeTab === 'status' && { color: '#10B981' }]}>Live Status</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.tab, activeTab === 'actions' && styles.activeTab]} onPress={() => setActiveTab('actions')}>
                                    <Text style={[styles.tabText, activeTab === 'actions' && { color: '#EF4444' }]}>Emergency Actions</Text>
                                </TouchableOpacity>
                            </View>


                            {activeTab === 'status' ? (
                                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 350 }}>
                                    {/* Detailed Stats Grid */}
                                    <View style={styles.statsGrid}>
                                        <View style={styles.statBox}>
                                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                                <Ionicons name="battery-charging" size={18} color="#10B981" />
                                            </View>
                                            <Text style={styles.statValue}>{girlData?.deviceInfo?.battery || 0}%</Text>
                                            <Text style={styles.statLabel}>Battery</Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                                                <Ionicons name="globe" size={18} color="#818CF8" />
                                            </View>
                                            <Text style={styles.statValue}>{girlData?.deviceInfo?.networkStatus || 'LTE'}</Text>
                                            <Text style={styles.statLabel}>Network</Text>
                                        </View>
                                    </View>

                                    {/* Today's Voyage Progress (Live Timeline) */}
                                    {girlData?.todayPlan && (
                                        <View style={styles.planProgressSection}>
                                            <View style={styles.sectionHeaderLine}>
                                                <Text style={styles.sectionTitle}>Voyage Progress</Text>
                                                <View style={styles.safetyBadge}>
                                                    <Text style={styles.safetyBadgeText}>SAFE ROUTE</Text>
                                                </View>
                                            </View>
                                            <View style={styles.planTimeline}>
                                                {girlData.todayPlan.points.map((p, index) => (
                                                    <View key={p.id} style={styles.planStep}>
                                                        <View style={styles.stepLeft}>
                                                            <View style={[styles.stepDot, index <= girlData.todayPlan.currentPointIndex && { backgroundColor: '#10B981' }]}>
                                                                {index < girlData.todayPlan.currentPointIndex ? (
                                                                    <Ionicons name="checkmark" size={12} color="#FFF" />
                                                                ) : (
                                                                    <Text style={styles.stepNum}>{index + 1}</Text>
                                                                )}
                                                            </View>
                                                            {index < girlData.todayPlan.points.length - 1 && <View style={styles.stepLine} />}
                                                        </View>
                                                        <View style={styles.stepRight}>
                                                            <Text style={[styles.stepTitle, index === girlData.todayPlan.currentPointIndex && { color: '#FFF', fontWeight: 'bold' }]}>
                                                                {p.name}
                                                            </Text>
                                                            <Text style={styles.stepStatus}>
                                                                {index < girlData.todayPlan.currentPointIndex ? 'Completed' : index === girlData.todayPlan.currentPointIndex ? 'Arriving Soon' : 'Planned'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {/* Live Journey Timeline */}
                                    <View style={styles.journeySection}>
                                        <Text style={styles.sectionTitle}>Current Journey</Text>
                                        <TimelineItem
                                            time="Started"
                                            title={girlData?.journeyStartAddr || "College Campus"}
                                            icon="location-outline"
                                            color="#10B981"
                                            active={false}
                                        />
                                        <TimelineItem
                                            time="Now"
                                            title={currentAddress || "Locating..."}
                                            icon="navigate"
                                            color="#8B5CF6"
                                            active={true}
                                            isLast={true}
                                        />
                                    </View>

                                    {/* Device Information Row */}
                                    <View style={styles.deviceInfoContainer}>
                                        <View style={styles.deviceCard}>
                                            <MaterialCommunityIcons name={girlData?.deviceInfo?.type === 'ios' ? 'apple' : 'android'} size={24} color="rgba(255,255,255,0.7)" />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={styles.deviceTitle}>{girlData?.deviceInfo?.model || 'Device Model'}</Text>
                                                <Text style={styles.deviceSub}>GPS Accuracy: {girlData?.lastLocation?.accuracy?.toFixed(1) || 0}m</Text>
                                            </View>
                                        </View>
                                        <View style={styles.signalBox}>
                                            <MaterialIcons name="signal-cellular-4-bar" size={18} color="#10B981" />
                                            <Text style={styles.signalText}>{girlData?.deviceInfo?.signalStrength || 'Strong'}</Text>
                                        </View>
                                    </View>
                                </ScrollView>
                            ) : (
                                <View style={styles.actionsGrid}>
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Calling Anu...")}>
                                        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.actionGradient}>
                                            <Ionicons name="call" size={28} color="#FFF" />
                                            <Text style={styles.actionText}>Call Anu</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("LOUD SIREN ACTIVATED")}>
                                        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.actionGradient}>
                                            <MaterialCommunityIcons name="alarm-light" size={28} color="#FFF" />
                                            <Text style={styles.actionText}>Trigger Siren</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </BlurView>
            </RNAnimated.View>

            {/* QR Code Modal for Adding Members */}
            <Modal
                transparent={true}
                visible={showQRModal}
                animationType="fade"
                onRequestClose={() => setShowQRModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={90} tint="dark" style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setShowQRModal(false)}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>

                        <Text style={styles.modalTitle}>Add Family Member</Text>
                        <View style={styles.expiryBadge}>
                            <Ionicons name="timer-outline" size={12} color="#F87171" />
                            <Text style={styles.expiryText}>Expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
                        </View>
                        <Text style={styles.modalSubtitle}>Scan this secure QR. It refreshes every 10 mins to prevent tampering.</Text>

                        <View style={styles.qrWrapper}>
                            <QRCode
                                value={`${girlData?.safetyId || 'THOZHI-IL939V'}|${qrSession}`}
                                size={180}
                                color="#FFF"
                                backgroundColor="transparent"
                            />
                        </View>

                        <View style={styles.idContainer}>
                            <Text style={styles.displayID}>{girlData?.safetyId || 'THOZHI-IL939V'}</Text>
                            <View style={styles.tokenBadge}>
                                <Text style={styles.tokenLabel}>SECURE TOKEN</Text>
                                <Text style={styles.tokenValue}>{qrSession}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.shareBtn} onPress={handleShareID}>
                            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.shareGradient}>
                                <Ionicons name="sparkles" size={20} color="#FFF" />
                                <Text style={styles.shareText}>Recruit Safety Squad</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocialShare('whatsapp')}>
                                <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocialShare('instagram')}>
                                <Ionicons name="logo-instagram" size={24} color="#E1306C" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIcon} onPress={() => handleSocialShare('facebook')}>
                                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </View>
            </Modal>
        </View>
    );
}


const TimelineItem = ({ time, title, icon, color, active, isLast }) => (
    <View style={styles.timelineItem}>
        <View style={styles.timelineLeft}><Text style={[styles.timelineTime, active && { color: "#fff" }]}>{time}</Text></View>
        <View style={styles.timelineCenter}>
            <View style={[styles.timelineDot, { backgroundColor: color, borderColor: active ? '#10B981' : '#1F2937' }]}><Ionicons name={icon} size={12} color="#FFF" /></View>
            {!isLast && <View style={styles.timelineLine} />}
        </View>
        <View style={styles.timelineRight}><Text style={[styles.timelineTitle, active && { color: "#fff", fontWeight: '700' }]}>{title}</Text></View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    hudContainer: { position: 'absolute', top: 50, left: 15, right: 15, borderRadius: 24, overflow: 'hidden' },
    hudGlass: { padding: 16, backgroundColor: 'rgba(20, 20, 30, 0.75)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    hudTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    scoreWrapper: { flexDirection: 'row', alignItems: 'center' },
    scoreContainer: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
    scoreTextContainer: { position: 'absolute', alignItems: 'center' },
    scoreValue: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    scoreLabel: { fontSize: 8, color: '#10B981', fontWeight: '700' },
    hudTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    hudSubtitle: { color: '#aaa', fontSize: 12 },
    squadContainer: { alignItems: 'flex-end' },
    squadLabel: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
    avatarRow: { flexDirection: 'row' },
    squadAvatarContainer: { marginLeft: -10, position: 'relative' },
    squadImage: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#1e1e1e' },
    squadStatus: { position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#1e1e1e' },
    addSquadBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginLeft: -10, borderWidth: 2, borderColor: '#1e1e1e' },


    searchBarContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)',
        marginTop: 12, borderRadius: 12, paddingHorizontal: 12, height: 44
    },
    searchInput: { flex: 1, color: '#FFF', marginLeft: 8 },
    goBtn: { backgroundColor: '#8B5CF6', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8 },
    goText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

    aiAlertBox: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
    aiAlertContent: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
    aiText: { color: '#93C5FD', fontSize: 12, flex: 1 },
    miniMarker: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    markerCore: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', padding: 2, elevation: 10 },
    markerImage: { width: '100%', height: '100%', borderRadius: 20 },
    onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff' },
    bottomSheetWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    bottomSheet: { backgroundColor: 'rgba(15, 23, 42, 0.95)', padding: 20, paddingBottom: 40 },
    tabRow: { flexDirection: 'row', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: 'rgba(255,255,255,0.1)' },
    tabText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
    sheetHandleContainer: { width: '100%', alignItems: 'center', paddingVertical: 10, marginBottom: 5 },
    sheetHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
    sheetHandleText: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 5, fontWeight: 'bold', textTransform: 'uppercase' },
    collapsedSheetContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, paddingVertical: 5 },
    compactAddr: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 15, marginRight: 15 },
    compactAddrText: { color: '#FFF', fontSize: 13, fontWeight: '500', flex: 1 },
    quickActionBtn: { overflow: 'hidden', borderRadius: 15 },
    quickActionGrad: { paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
    quickActionText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: 4, borderRadius: 16, padding: 12, alignItems: 'center' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { color: '#fff', fontWeight: '700', fontSize: 16 },
    statLabel: { color: '#aaa', fontSize: 12 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    actionBtn: { width: '48%', borderRadius: 16, overflow: 'hidden' },
    actionGradient: { padding: 16, alignItems: 'center', justifyContent: 'center', height: 100, gap: 8 },
    actionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    // Device Info Styles
    deviceInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 20,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    deviceCard: { flexDirection: 'row', alignItems: 'center' },
    deviceTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
    deviceSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
    signalBox: { alignItems: 'center' },
    signalText: { color: '#60A5FA', fontSize: 10, fontWeight: 'bold', marginTop: 2 },
    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.85, borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    closeBtn: { position: 'absolute', top: 20, right: 20 },
    modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    modalSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 30 },
    qrWrapper: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 20 },
    displayID: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
    idContainer: { alignItems: 'center', marginBottom: 25 },
    tokenBadge: { backgroundColor: 'rgba(124, 58, 237, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.3)', alignItems: 'center' },
    tokenLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 'bold' },
    tokenValue: { color: '#A78BFA', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
    expiryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(248, 113, 113, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 12, gap: 5 },
    expiryText: { color: '#F87171', fontSize: 11, fontWeight: 'bold' },
    shareBtn: { width: '100%', borderRadius: 15, overflow: 'hidden', marginBottom: 20 },
    shareGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, gap: 10 },
    shareText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    socialRow: { flexDirection: 'row', gap: 20 },
    socialIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

    // Journey Timeline Styles
    journeySection: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', marginTop: 10 },
    sectionTitle: { color: '#60A5FA', fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
    timelineItem: { flexDirection: 'row', marginBottom: 15 },
    timelineLeft: { width: 60, alignItems: 'flex-end', paddingTop: 2 },
    timelineTime: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' },
    timelineCenter: { width: 40, alignItems: 'center' },
    timelineDot: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 3, zIndex: 1 },
    timelineLine: { position: 'absolute', top: 20, bottom: -15, width: 2, backgroundColor: '#1F2937' },
    timelineRight: { flex: 1, paddingTop: 0 },
    timelineTitle: { color: '#9CA3AF', fontSize: 14, fontWeight: '500' },

    // Enhanced Marker & HUD Styles
    imageClip: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    directionArrow: {
        position: 'absolute',
        top: -10,
        zIndex: 10,
    },
    liveBadgeWrapper: {
        position: 'absolute',
        top: 240,
        alignSelf: 'center',
        zIndex: 100,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 8,
        shadowColor: '#10B981',
        shadowRadius: 5,
        shadowOpacity: 1,
    },
    liveText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    vDivider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginHorizontal: 8,
    },
    speedText: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
    },
    mapControls: {
        position: 'absolute',
        right: 20,
        top: 240,
        gap: 12,
        zIndex: 100,
    },
    controlBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    controlBlur: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Voyage Plan Styles
    planNode: { alignItems: 'center' },
    nodeCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    nodeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    activeTag: { backgroundColor: '#8B5CF6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    activeTagText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },
    planProgressSection: { marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 20 },
    sectionHeaderLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    safetyBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    safetyBadgeText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
    planTimeline: { paddingLeft: 10 },
    planStep: { flexDirection: 'row', gap: 15 },
    stepLeft: { alignItems: 'center' },
    stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#374151', justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    stepNum: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    stepLine: { width: 2, height: 40, backgroundColor: '#1F2937', marginTop: -5 },
    stepRight: { flex: 1, paddingBottom: 25 },
    stepTitle: { color: '#9CA3AF', fontSize: 14 },
    stepStatus: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
    // Voyage HUD Styles
    voyageHUD: {
        position: 'absolute',
        top: 170,
        left: 20,
        right: 20,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 100,
    },
    voyageHUDBlur: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    voyageHUDLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    voyageIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    voyageHUDTitle: {
        color: '#10B981',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    voyageHUDStatus: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    voyageHUDRight: {
        alignItems: 'flex-end',
    },
    voyageHUDDest: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '600',
    },
});
