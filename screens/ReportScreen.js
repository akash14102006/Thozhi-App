import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ReportScreen({ navigation }) {
    const [reportType, setReportType] = useState('Harassment');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reportTypes = [
        { id: 'Harassment', icon: 'chatbubble-ellipses', color: '#F472B6' },
        { id: 'Stalking', icon: 'eye', color: '#60A5FA' },
        { id: 'Unsafe Area', icon: 'location-outline', color: '#FACC15' },
        { id: 'Other', icon: 'warning-outline', color: '#A78BFA' },
    ];

    const handleSubmit = () => {
        if (!description) {
            Alert.alert("Error", "Please provide a description of the incident.");
            return;
        }

        setIsSubmitting(true);
        
        setTimeout(() => {
            setIsSubmitting(false);
            Alert.alert(
                "Report Submitted",
                "Your report has been sent to the Police Akka network and added to the AI safety map anonymously.",
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );
        }, 2000);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#1F0A3C', '#12002B', '#0D0915']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Report Incident</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.aiAlert}>
                        <BlurView intensity={20} tint="dark" style={styles.aiBlur}>
                            <MaterialCommunityIcons name="robot-happy" size={20} color="#60A5FA" />
                            <Text style={styles.aiText}>Your report helps keep other women safe in this area. It remains 100% anonymous.</Text>
                        </BlurView>
                    </View>

                    <Text style={styles.sectionLabel}>WHAT'S THE ISSUE?</Text>
                    <View style={styles.typesGrid}>
                        {reportTypes.map((type) => (
                            <TouchableOpacity
                                key={type.id}
                                style={[
                                    styles.typeCard,
                                    reportType === type.id && { borderColor: type.color, backgroundColor: `${type.color}15` }
                                ]}
                                onPress={() => setReportType(type.id)}
                            >
                                <Ionicons name={type.icon} size={24} color={reportType === type.id ? type.color : '#FFF'} />
                                <Text style={[styles.typeText, reportType === type.id && { color: type.color }]}>{type.id}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionLabel}>DESCRIPTION</Text>
                    <View style={styles.inputCard}>
                        <BlurView intensity={10} tint="dark" style={styles.inputBlur}>
                            <TextInput
                                style={styles.input}
                                placeholder="Tell us what happened..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                multiline
                                numberOfLines={6}
                                value={description}
                                onChangeText={setDescription}
                                textAlignVertical="top"
                            />
                        </BlurView>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.5)" />
                        <Text style={styles.infoText}>This will be pinned on the local heat-map to warn other users nearby.</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    >
                        <LinearGradient
                            colors={['#EF4444', '#991B1B']}
                            style={styles.submitGradient}
                        >
                            <Text style={styles.submitText}>{isSubmitting ? 'SUBMITTING...' : 'SUBMIT ANONYMOUS REPORT'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0915' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 8 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

    aiAlert: { marginBottom: 30, borderRadius: 16, overflow: 'hidden' },
    aiBlur: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 12 },
    aiText: { color: '#93C5FD', fontSize: 13, flex: 1, lineHeight: 18 },

    sectionLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },

    typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
    typeCard: {
        width: (width - 52) / 2,
        height: 100,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    typeText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

    inputCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
    inputBlur: { padding: 15 },
    input: { color: '#FFF', fontSize: 15, height: 120 },

    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40, paddingHorizontal: 5 },
    infoText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },

    submitBtn: { height: 56, borderRadius: 28, overflow: 'hidden', elevation: 8 },
    submitGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    submitText: { color: '#FFF', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 }
});
