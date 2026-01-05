import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = (props) => {
    return (
        <View style={[props.style, styles.container]}>
            <Text style={styles.text}>Map View is not supported on Web</Text>
        </View>
    );
};

export const Marker = () => null;
export const Polyline = () => null;

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1F2937',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    text: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 14,
    }
});

export default MapView;
