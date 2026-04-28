import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import SafeMap, { Marker } from '../components/SafeMap';

const { width, height } = Dimensions.get('window');

export default function TestMapScreen() {
    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 13.1320,
                    longitude: 80.1994,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                <Marker
                    coordinate={{
                        latitude: 13.1320,
                        longitude: 80.1994
                    }}
                    title="Test Location"
                />
            </MapView>
            <View style={styles.overlay}>
                <Text style={styles.text}>Test Map - If you see this with map, it works!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: width,
        height: height,
    },
    overlay: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 20,
        borderRadius: 10,
    },
    text: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
