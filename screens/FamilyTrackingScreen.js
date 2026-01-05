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
    TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from '../components/SafeMap';
import * as Location from 'expo-location';
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

const { width, height } = Dimensions.get('window');


const SAFETY_SCORE = 92;
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


const PulsingMarker = () => {
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
            <View style={styles.markerCore}>
                <Image source={{ uri: 'https://img.freepik.com/free-photo/portrait-young-indian-woman-happy-smiling_231208-2519.jpg' }} style={styles.markerImage} />
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
    const [destination, setDestination] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);

    
    const riskZones = [
        { latitude: 37.7925, longitude: -122.434, radius: 150, color: 'rgba(239, 68, 68, 0.25)' }, 
        { latitude: 37.7895, longitude: -122.433, radius: 180, color: 'rgba(245, 158, 11, 0.2)' },  
    ];

    const currentLoc = { latitude: 37.7915, longitude: -122.436 };
    const destLoc = { latitude: 37.78825, longitude: -122.4324 }; 

    
    const route = [
        currentLoc,
        { latitude: 37.78925, longitude: -122.4334 },
        { latitude: 37.7915, longitude: -122.436 }, 
        destLoc
    ];

    const handleStartNavigation = () => {
        if (!destination) return alert("Please enter a destination");
        setIsNavigating(true);
        Alert.alert("Navigation Started", `Monitoring route to: ${destination}`);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <MapView
                style={StyleSheet.absoluteFill}
                customMapStyle={MAP_THEME_DARK}
                initialRegion={{
                    latitude: currentLoc.latitude,
                    longitude: currentLoc.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                }}
            >
                {}
                {riskZones.map((zone, i) => (
                    <Circle key={`risk-${i}`} center={zone} radius={zone.radius} fillColor={zone.color} strokeColor="rgba(0,0,0,0)" />
                ))}

                {}
                {isNavigating && (
                    <>
                        <Polyline coordinates={route} strokeColor="#8B5CF6" strokeWidth={4} />
                        <Marker coordinate={destLoc}>
                            <View style={[styles.miniMarker, { backgroundColor: '#F472B6' }]}><Ionicons name="flag" size={14} color="#fff" /></View>
                        </Marker>
                    </>
                )}

                {}
                <Marker coordinate={currentLoc}>
                    <PulsingMarker />
                </Marker>
            </MapView>

            {}
            <View style={styles.hudContainer}>
                <BlurView intensity={40} tint="dark" style={styles.hudGlass}>
                    <View style={styles.hudTopRow}>

                        {}
                        <View style={styles.scoreWrapper}>
                            <SafetyScoreRing score={SAFETY_SCORE} />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.hudTitle}>Tracking Anu</Text>
                                <Text style={styles.hudSubtitle}>Live Status: Active</Text>
                            </View>
                        </View>

                        {}
                        <View style={styles.squadContainer}>
                            <Text style={styles.squadLabel}>Watching:</Text>
                            <View style={styles.avatarRow}>
                                <SquadAvatar image="https://randomuser.me/api/portraits/men/32.jpg" status="active" />
                                <View style={styles.addSquadBtn}><Ionicons name="add" size={16} color="#FFF" /></View>
                            </View>
                        </View>
                    </View>

                    {}
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            placeholder="Where is she going?"
                            placeholderTextColor="#6B7280"
                            style={styles.searchInput}
                            value={destination}
                            onChangeText={setDestination}
                        />
                        <TouchableOpacity style={styles.goBtn} onPress={handleStartNavigation}>
                            <Text style={styles.goText}>GO</Text>
                        </TouchableOpacity>
                    </View>

                    {}
                    <Animated.View entering={FadeInDown.delay(500)} style={styles.aiAlertBox}>
                        <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.1)']} style={styles.aiAlertContent}>
                            <MaterialCommunityIcons name="robot-happy-outline" size={20} color="#60A5FA" />
                            <Text style={styles.aiText}>AI Insight: She is on the usual path to College.</Text>
                        </LinearGradient>
                    </Animated.View>
                </BlurView>
            </View>

            {}
            <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.bottomSheetWrapper}>
                <BlurView intensity={80} tint="dark" style={styles.bottomSheet}>

                    {}
                    <View style={styles.tabRow}>
                        <TouchableOpacity style={[styles.tab, activeTab === 'status' && styles.activeTab]} onPress={() => setActiveTab('status')}>
                            <Text style={[styles.tabText, activeTab === 'status' && { color: '#FFF' }]}>Live Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.tab, activeTab === 'actions' && styles.activeTab]} onPress={() => setActiveTab('actions')}>
                            <Text style={[styles.tabText, activeTab === 'actions' && { color: '#F87171' }]}>Emergency Actions</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'status' ? (
                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
                            {}
                            <View style={styles.statsGrid}>
                                <View style={styles.statBox}>
                                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                                        <Ionicons name="battery-charging" size={18} color="#10B981" />
                                    </View>
                                    <Text style={styles.statValue}>78%</Text>
                                    <Text style={styles.statLabel}>Battery</Text>
                                </View>
                                <View style={styles.statBox}>
                                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.2)' }]}>
                                        <Ionicons name="speedometer" size={18} color="#818CF8" />
                                    </View>
                                    <Text style={styles.statValue}>24 km/h</Text>
                                    <Text style={styles.statLabel}>Speed</Text>
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

                </BlurView>
            </Animated.View>
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
    squadLabel: { color: '#aaa', fontSize: 10, marginBottom: 4 },
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
    tabText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', marginHorizontal: 4, borderRadius: 16, padding: 12, alignItems: 'center' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    statValue: { color: '#fff', fontWeight: '700', fontSize: 16 },
    statLabel: { color: '#aaa', fontSize: 12 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
    actionBtn: { width: '48%', borderRadius: 16, overflow: 'hidden' },
    actionGradient: { padding: 16, alignItems: 'center', justifyContent: 'center', height: 100, gap: 8 },
    actionText: { color: '#fff', fontWeight: '600', fontSize: 14 }
});
