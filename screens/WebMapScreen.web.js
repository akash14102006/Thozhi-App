import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SafeMap, { Marker } from '../components/SafeMap';

const { width, height } = Dimensions.get('window');

export default function WebMapScreen({ route }) {
    const { latitude = 13.1320, longitude = 80.1994, zoom = 13 } = route?.params || {};

    const region = {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.05, // Approximation for zoom
        longitudeDelta: 0.05,
    };

    return (
        <View style={styles.container}>
            <SafeMap
                region={region}
                style={styles.map}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    title="Your Location"
                />
            </SafeMap>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
