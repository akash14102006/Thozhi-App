import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';

const SafeMap = React.forwardRef((props, ref) => {
    return (
        <MapView
            ref={ref}
            provider={PROVIDER_GOOGLE}
            style={styles.container}
            mapType="standard"
            showsUserLocation={true}
            showsMyLocationButton={true}
            {...props}
        />
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
});

export default SafeMap;
export { SafeMap, Marker, Polyline, Circle, PROVIDER_GOOGLE };
