import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function FamilyScreen({ navigation }) {
    
    const [isLive, setIsLive] = useState(true);
    const [parents, setParents] = useState([
        { id: 1, name: 'Dad', status: 'Online', role: 'Admin' },
        { id: 2, name: 'Mom', status: 'Last seen 5m ago', role: 'Viewer' },
    ]);
    const [routes, setRoutes] = useState([
        { id: 1, name: 'Home to College', time: 'Morning' },
        { id: 2, name: 'College to Home', time: 'Evening' },
    ]);

    const renderParentItem = (parent) => (
        <View key={parent.id} style={styles.listItem}>
            <View style={styles.listIcon}>
                <Ionicons name="person" size={20} color="#E9D5FF" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{parent.name}</Text>
                <Text style={styles.listSub}>{parent.status}</Text>
            </View>
            <View style={styles.statusBadge}>
                <Ionicons name="eye-outline" size={14} color="#34D399" />
            </View>
        </View>
    );

    const renderRouteItem = (route) => (
        <View key={route.id} style={styles.listItem}>
            <View style={[styles.listIcon, { backgroundColor: 'rgba(96, 165, 250, 0.2)' }]}>
                <Ionicons name="navigate" size={20} color="#60A5FA" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{route.name}</Text>
                <Text style={styles.listSub}>{route.time}</Text>
            </View>
            <TouchableOpacity onPress={() => console.log('Edit route')}>
                <Ionicons name="settings-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </View>
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
                <Text style={styles.headerTitle}>Family Mode</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ParentConnection')} style={styles.addButton}>
                    <Ionicons name="person-add-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {}
                <View style={styles.statusCard}>
                    <LinearGradient
                        colors={isLive ? ['#059669', '#10B981'] : ['#4B5563', '#6B7280']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.statusGradient}
                    >
                        <View style={styles.statusHeader}>
                            <View style={styles.statusTextContainer}>
                                <Text style={styles.statusLabel}>MONITORING STATUS</Text>
                                <Text style={styles.statusMainText}>{isLive ? 'Active & Live' : 'Paused'}</Text>
                            </View>
                            <View style={styles.pulseContainer}>
                                <View style={styles.activeDot} />
                            </View>
                        </View>
                        <Text style={styles.statusDesc}>
                            Parents can see your live location and safety status.
                        </Text>
                    </LinearGradient>
                </View>

                {}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Linked Parents</Text>
                </View>
                <View style={styles.listContainer}>
                    {parents.map(renderParentItem)}
                </View>

                {}
                <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                    <Text style={styles.sectionTitle}>Daily Safe Routes</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RouteSetup')}>
                        <Text style={styles.linkText}>+ Add New</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.listContainer}>
                    {routes.map(renderRouteItem)}
                </View>

                {}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scoreNumber}>94</Text>
                        <Text style={styles.scoreLabel}>SAFE</Text>
                    </View>
                    <View style={styles.scoreInfo}>
                        <Text style={styles.scoreTitle}>Route Safety Score</Text>
                        <Text style={styles.scoreDesc}>
                            Your current route is verified safe based on lighting, crowd, and police patrol data.
                        </Text>
                    </View>
                </View>

                {}
                <TouchableOpacity
                    style={styles.demoButton}
                    onPress={() => navigation.navigate('ParentDashboard')}
                >
                    <Text style={styles.demoButtonText}>👁️ SIMULATE PARENT VIEW (DEMO)</Text>
                </TouchableOpacity>

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
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    addButton: {
        padding: 8,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    statusCard: {
        borderRadius: 20,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    statusGradient: {
        borderRadius: 20,
        padding: 20,
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    statusLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statusMainText: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    activeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
        shadowColor: "#FFF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },
    statusDesc: {
        color: '#E0E7FF',
        fontSize: 13,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkText: {
        color: '#34D399',
        fontWeight: '600',
    },
    listContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    listIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(233, 213, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    listTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listSub: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
        marginTop: 2,
    },
    statusBadge: {
        padding: 6,
        backgroundColor: 'rgba(52, 211, 153, 0.1)',
        borderRadius: 12,
    },
    scoreCard: {
        marginTop: 30,
        backgroundColor: 'rgba(30, 41, 59, 0.6)',
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    scoreCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    scoreNumber: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    scoreLabel: {
        color: '#10B981',
        fontSize: 8,
        fontWeight: 'bold',
    },
    scoreInfo: {
        flex: 1,
    },
    scoreTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    scoreDesc: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 11,
        lineHeight: 16,
    },
    demoButton: {
        marginTop: 30,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        borderStyle: 'dashed'
    },
    demoButtonText: {
        color: '#A78BFA',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1
    }
});
