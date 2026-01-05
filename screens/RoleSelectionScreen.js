import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const RoleCard = ({ icon, IconLib, title, subtitle, color, onPress, isSelected }) => (
    <TouchableOpacity
        style={[styles.roleCard, isSelected && styles.roleCardSelected]}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <BlurView intensity={20} tint="dark" style={styles.roleCardBlur}>
            <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <IconLib name={icon} size={40} color={color} />
            </View>
            <Text style={styles.roleTitle}>{title}</Text>
            <Text style={styles.roleSubtitle}>{subtitle}</Text>
            {isSelected && (
                <View style={styles.checkmark}>
                    <Ionicons name="checkmark-circle" size={24} color="#34D399" />
                </View>
            )}
        </BlurView>
    </TouchableOpacity>
);

export default function RoleSelectionScreen({ navigation }) {
    const [selectedRole, setSelectedRole] = useState(null);

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        
        setTimeout(() => {
            if (role === 'girl') {
                navigation.navigate('GirlLogin');
            } else if (role === 'family') {
                navigation.navigate('FamilyLogin');
            } else if (role === 'police') {
                navigation.navigate('PoliceLogin');
            }
        }, 300);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {}
            <LinearGradient
                colors={['#1F0A3C', '#2E1065', '#4C1D95']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {}
            <View style={[styles.circle, styles.circle1]} />
            <View style={[styles.circle, styles.circle2]} />

            {}
            <View style={styles.content}>
                {}
                <View style={styles.logoSection}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={require('../assets/images/app-logo.png')}
                            style={styles.logo}
                            resizeMode="cover"
                        />
                    </View>
                    <Text style={styles.appName}>Thozhi</Text>
                    <Text style={styles.tagline}>Your Safety Companion</Text>
                </View>

                {}
                <Text style={styles.question}>Who are you?</Text>
                <Text style={styles.questionSubtitle}>Choose your role to continue</Text>

                {}
                <View style={styles.rolesContainer}>
                    <RoleCard
                        icon="person"
                        IconLib={Ionicons}
                        title="Girl / Woman"
                        subtitle="For safety & support"
                        color="#EC4899"
                        isSelected={selectedRole === 'girl'}
                        onPress={() => handleRoleSelect('girl')}
                    />

                    <RoleCard
                        icon="family-restroom"
                        IconLib={MaterialIcons}
                        title="Family Squad"
                        subtitle="Track & protect loved ones"
                        color="#A78BFA"
                        isSelected={selectedRole === 'family'}
                        onPress={() => handleRoleSelect('family')}
                    />

                    <RoleCard
                        icon="shield-account"
                        IconLib={MaterialCommunityIcons}
                        title="Police Akka"
                        subtitle="Respond & protect"
                        color="#60A5FA"
                        isSelected={selectedRole === 'police'}
                        onPress={() => handleRoleSelect('police')}
                    />
                </View>

                {}
                <Text style={styles.footerText}>
                    Tap a role to get started. {'\n'}
                    Your choice will determine your dashboard.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1F0A3C',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
        paddingTop: 60,
    },
    
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        opacity: 0.1,
    },
    circle1: {
        width: 300,
        height: 300,
        backgroundColor: '#A78BFA',
        top: -100,
        right: -50,
    },
    circle2: {
        width: 400,
        height: 400,
        backgroundColor: '#EC4899',
        bottom: -150,
        left: -100,
    },
    
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoWrapper: {
        width: 100, 
        height: 100,
        borderRadius: 50, 
        marginBottom: 12,
        backgroundColor: '#FFF',
        overflow: 'hidden', 
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        letterSpacing: 1,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 4,
    },
    
    question: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    questionSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 40,
    },
    
    rolesContainer: {
        gap: 16,
        marginBottom: 30,
    },
    roleCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    roleCardSelected: {
        borderColor: '#34D399',
        borderWidth: 3,
    },
    roleCardBlur: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    roleTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 4,
    },
    roleSubtitle: {
        position: 'absolute',
        left: 96,
        bottom: 20,
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
    },
    checkmark: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    
    footerText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        lineHeight: 20,
    },
});
