import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, ScrollView, Animated, Easing, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from '../components/SafeMap';
import SafetyIdentityCard from '../components/SafetyIdentityCard';

const { width, height } = Dimensions.get('window');

const FeatureCard = ({ icon, title, subtitle, color, onPress, IconLib = Ionicons }) => (
    <TouchableOpacity style={styles.cardWrapper} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.cardContainer}>
            {}
            <View style={[styles.cardTint, { backgroundColor: color }]} />

            {}
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

export default function HomeScreen({ navigation }) {
    const [location, setLocation] = useState(null);
    const [safetyId, setSafetyId] = useState('');
    const [userName, setUserName] = useState('Warrior');
    const [showIdentityCard, setShowIdentityCard] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        
        (async () => {
            try {
                const id = await AsyncStorage.getItem('SAFETY_ID');
                const userData = await AsyncStorage.getItem('USER_DATA');
                if (id) setSafetyId(id);
                if (userData) {
                    const user = JSON.parse(userData);
                    if (user.name) setUserName(user.name);
                }
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
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let loc = await Location.getCurrentPositionAsync({});
                setLocation(loc);
                
                await Location.watchPositionAsync({
                    accuracy: Location.Accuracy.High,
                    timeInterval: 2000,
                    distanceInterval: 10
                }, (newLoc) => {
                    setLocation(newLoc);
                });
            }
        })();
    }, []);

    const handleSOS = () => {
        Alert.alert(
            "🚨 SOS TRIGGERED!",
            "Recording Audio Evidence & Sharing Live Location...",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", onPress: () => setTimeout(() => alert("Evidence Uploaded to Cloud Ref: #SOS-9921"), 3000) }
            ]
        );
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar style="light" />

            {}
            <View style={StyleSheet.absoluteFill}>
                <MapView
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        latitude: location?.coords.latitude || 37.78825,
                        longitude: location?.coords.longitude || -122.4324,
                        latitudeDelta: 0.005, 
                        longitudeDelta: 0.005,
                    }}
                    region={location ? {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    } : undefined}
                    showsUserLocation={true}
                    followsUserLocation={true} 
                    showsCompass={false}
                />

                {}
                <LinearGradient
                    colors={['transparent', 'rgba(13, 9, 21, 0.8)', '#0D0915']}
                    style={styles.mapBottomFade}
                />
            </View>

            {}
            <BlurView intensity={30} tint="dark" style={styles.glassHeader}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => setShowIdentityCard(true)}
                    activeOpacity={0.8}
                >
                    <View style={styles.avatarBubble}>
                        <Ionicons name="person" size={20} color="#FFF" />
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
            </BlurView>

            {}
            <View style={styles.floatingContent}>

                {}
                <View style={styles.sosContainer}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
                    <TouchableOpacity activeOpacity={0.9} onPress={handleSOS} style={styles.sosButton}>
                        <LinearGradient
                            colors={['#FF3B30', '#990000']}
                            style={styles.sosGradient}
                        >
                            <FontAwesome5 name="power-off" size={28} color="#FFF" />
                            <Text style={styles.sosText}>SOS</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {}
                <View style={styles.dashboardCard}>
                    {}
                    <Image
                        source={require('../assets/images/dashboard-bg.png')}
                        style={styles.cardBackgroundImage}
                        resizeMode="stretch"
                    />

                    {}
                    <View style={styles.dashboardContent}>
                        <View style={styles.handleBar} />

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridContainer}>
                            {}
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

                            {}
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

                            {}
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
                </View>
            </View>

            {}
            {showIdentityCard && (
                <SafetyIdentityCard
                    safetyId={safetyId}
                    userName={userName}
                    onClose={() => setShowIdentityCard(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#0D0915' },

    
    mapBottomFade: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.6,
        pointerEvents: 'none',
    },

    
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
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(20, 15, 30, 0.4)',
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarBubble: {
        width: 42, height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
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
    sosText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginTop: 4 },

    
    dashboardCard: {
        width: width * 0.92,
        backgroundColor: 'rgba(21, 16, 34, 0.9)',
        borderRadius: 32,
        borderWidth: 2, 
        borderColor: '#7C3AED', 
        shadowColor: "#8B5CF6", 
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 25,
        elevation: 35,
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
        opacity: 0.15,
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
    toolText: { color: '#D1D5DB', fontSize: 12, fontWeight: '600' }
});
