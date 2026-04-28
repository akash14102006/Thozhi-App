import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import GoogleMapsService from '../services/googleMapsService';

export default function GoogleAPITestScreen() {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState([]);

    const addResult = (name, success, data) => {
        setResults(prev => [...prev, { name, success, data, time: new Date().toLocaleTimeString() }]);
    };

    const testRouteAPI = async () => {
        setTesting(true);
        try {
            const origin = { latitude: 13.1320, longitude: 80.1994 }; // Puthagaram
            const destination = { latitude: 13.0827, longitude: 80.2707 }; // Chennai

            const result = await GoogleMapsService.getRoute(origin, destination);

            if (result.success) {
                const route = result.routes[0];
                const distance = (route.distance / 1000).toFixed(1);
                const duration = Math.round(parseInt(route.duration.replace('s', '')) / 60);

                addResult('Routes API', true, `Distance: ${distance} km, Duration: ${duration} mins`);
                Alert.alert('✅ Routes API Working!', `Found route: ${distance} km, ${duration} mins`);
            } else {
                addResult('Routes API', false, result.error);
                Alert.alert('❌ Routes API Failed', result.error);
            }
        } catch (error) {
            addResult('Routes API', false, error.message);
            Alert.alert('❌ Error', error.message);
        }
        setTesting(false);
    };

    const testPlacesAPI = async () => {
        setTesting(true);
        try {
            const location = { latitude: 13.1320, longitude: 80.1994 };

            const result = await GoogleMapsService.findNearbyPlaces(location, 'police', 5000);

            if (result.success) {
                const count = result.places.length;
                addResult('Places API', true, `Found ${count} police stations`);
                Alert.alert('✅ Places API Working!', `Found ${count} police stations nearby`);
            } else {
                addResult('Places API', false, result.error);
                Alert.alert('❌ Places API Failed', result.error);
            }
        } catch (error) {
            addResult('Places API', false, error.message);
            Alert.alert('❌ Error', error.message);
        }
        setTesting(false);
    };

    const testDistanceMatrixAPI = async () => {
        setTesting(true);
        try {
            const origins = [{ latitude: 13.1320, longitude: 80.1994 }];
            const destinations = [
                { latitude: 13.0827, longitude: 80.2707 },
                { latitude: 13.0500, longitude: 80.2500 }
            ];

            const result = await GoogleMapsService.getDistanceMatrix(origins, destinations);

            if (result.success) {
                const first = result.distances[0].destinations[0];
                const distance = (first.distance.value / 1000).toFixed(1);

                addResult('Distance Matrix API', true, `Distance: ${distance} km`);
                Alert.alert('✅ Distance Matrix Working!', `Calculated: ${distance} km`);
            } else {
                addResult('Distance Matrix API', false, result.error);
                Alert.alert('❌ Distance Matrix Failed', result.error);
            }
        } catch (error) {
            addResult('Distance Matrix API', false, error.message);
            Alert.alert('❌ Error', error.message);
        }
        setTesting(false);
    };

    const testGeocodingAPI = async () => {
        setTesting(true);
        try {
            const result = await GoogleMapsService.geocodeAddress('Marina Beach, Chennai');

            if (result.success) {
                const coords = `${result.location.latitude.toFixed(4)}, ${result.location.longitude.toFixed(4)}`;
                addResult('Geocoding API', true, coords);
                Alert.alert('✅ Geocoding Working!', `Location: ${coords}`);
            } else {
                addResult('Geocoding API', false, result.error);
                Alert.alert('❌ Geocoding Failed', result.error);
            }
        } catch (error) {
            addResult('Geocoding API', false, error.message);
            Alert.alert('❌ Error', error.message);
        }
        setTesting(false);
    };

    const testReverseGeocodingAPI = async () => {
        setTesting(true);
        try {
            const result = await GoogleMapsService.reverseGeocode(13.1320, 80.1994);

            if (result.success) {
                addResult('Reverse Geocoding', true, result.address.substring(0, 50) + '...');
                Alert.alert('✅ Reverse Geocoding Working!', result.address);
            } else {
                addResult('Reverse Geocoding', false, result.error);
                Alert.alert('❌ Reverse Geocoding Failed', result.error);
            }
        } catch (error) {
            addResult('Reverse Geocoding', false, error.message);
            Alert.alert('❌ Error', error.message);
        }
        setTesting(false);
    };

    const testRoadsAPI = async () => {
        setTesting(true);
        try {
            const points = [
                { latitude: 13.1320, longitude: 80.1994 },
                { latitude: 13.1325, longitude: 80.1999 },
                { latitude: 13.1330, longitude: 80.2004 }
            ];

            const result = await GoogleMapsService.snapToRoads(points);

            if (result.success) {
                const count = result.snappedPoints.length;
                addResult('Roads API', true, `Snapped ${count} points`);
                Alert.alert('✅ Roads API Working!', `Snapped ${count} GPS points to roads`);
            } else {
                addResult('Roads API', false, result.error);
                Alert.alert('❌ Roads API Failed', result.error);
            }
        } catch (error) {
            addResult('Roads API', false, error.message);
            Alert.alert('❌ Error', error.message);
        }
        setTesting(false);
    };

    const testAllAPIs = async () => {
        setResults([]);
        await testRouteAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testPlacesAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testDistanceMatrixAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testGeocodingAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testReverseGeocodingAPI();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await testRoadsAPI();

        Alert.alert('✅ All Tests Complete!', 'Check results below');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                <Text style={styles.title}>🧪 Google APIs Test</Text>
                <Text style={styles.subtitle}>Test all Google Maps Platform APIs</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Test Buttons */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Individual Tests</Text>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testRouteAPI}
                        disabled={testing}
                    >
                        <Ionicons name="navigate" size={24} color="#FFF" />
                        <Text style={styles.buttonText}>Test Routes API (NEW)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testPlacesAPI}
                        disabled={testing}
                    >
                        <Ionicons name="location" size={24} color="#FFF" />
                        <Text style={styles.buttonText}>Test Places API</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testDistanceMatrixAPI}
                        disabled={testing}
                    >
                        <Ionicons name="analytics" size={24} color="#FFF" />
                        <Text style={styles.buttonText}>Test Distance Matrix</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testGeocodingAPI}
                        disabled={testing}
                    >
                        <Ionicons name="search" size={24} color="#FFF" />
                        <Text style={styles.buttonText}>Test Geocoding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testReverseGeocodingAPI}
                        disabled={testing}
                    >
                        <Ionicons name="pin" size={24} color="#FFF" />
                        <Text style={styles.buttonText}>Test Reverse Geocoding</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.testButton}
                        onPress={testRoadsAPI}
                        disabled={testing}
                    >
                        <Ionicons name="car" size={24} color="#FFF" />
                        <Text style={styles.buttonText}>Test Roads API</Text>
                    </TouchableOpacity>
                </View>

                {/* Test All Button */}
                <TouchableOpacity
                    style={styles.testAllButton}
                    onPress={testAllAPIs}
                    disabled={testing}
                >
                    <Ionicons name="rocket" size={28} color="#FFF" />
                    <Text style={styles.testAllText}>🚀 Test All APIs</Text>
                </TouchableOpacity>

                {/* Loading */}
                {testing && (
                    <View style={styles.loading}>
                        <ActivityIndicator size="large" color="#7C3AED" />
                        <Text style={styles.loadingText}>Testing API...</Text>
                    </View>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <View style={styles.results}>
                        <Text style={styles.resultsTitle}>Test Results:</Text>
                        {results.map((result, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.resultItem,
                                    result.success ? styles.resultSuccess : styles.resultError
                                ]}
                            >
                                <View style={styles.resultHeader}>
                                    <Ionicons
                                        name={result.success ? "checkmark-circle" : "close-circle"}
                                        size={20}
                                        color={result.success ? "#10B981" : "#EF4444"}
                                    />
                                    <Text style={styles.resultName}>{result.name}</Text>
                                    <Text style={styles.resultTime}>{result.time}</Text>
                                </View>
                                <Text style={styles.resultData}>{result.data}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Instructions */}
                <View style={styles.instructions}>
                    <Text style={styles.instructionTitle}>📖 What to Check:</Text>
                    <Text style={styles.instructionText}>
                        ✅ If all tests pass: Google APIs are working!{'\n'}
                        ❌ If tests fail: Check that APIs are enabled in Google Console{'\n\n'}
                        Enable missing APIs at:{'\n'}
                        console.cloud.google.com/apis/library
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0D0915',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#1A1625',
        borderBottomWidth: 1,
        borderBottomColor: '#7C3AED33',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#A78BFA',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 15,
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#7C3AED',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    testAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        gap: 12,
    },
    testAllText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loading: {
        alignItems: 'center',
        padding: 30,
    },
    loadingText: {
        color: '#A78BFA',
        marginTop: 12,
        fontSize: 16,
    },
    results: {
        marginTop: 20,
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 15,
    },
    resultItem: {
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    resultSuccess: {
        backgroundColor: '#10B981',
        borderColor: '#059669',
    },
    resultError: {
        backgroundColor: '#EF4444',
        borderColor: '#DC2626',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    resultName: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    resultTime: {
        color: '#FFF',
        fontSize: 12,
        opacity: 0.8,
    },
    resultData: {
        color: '#FFF',
        fontSize: 14,
        marginLeft: 28,
    },
    instructions: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#1A1625',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#7C3AED33',
    },
    instructionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFF',
        marginBottom: 12,
    },
    instructionText: {
        fontSize: 14,
        color: '#A78BFA',
        lineHeight: 22,
    },
});
