import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

// Only import leaflet for web
let L;
if (Platform.OS === 'web') {
    try {
        L = require('leaflet');
        // Fix for default marker icons
        if (L.Icon && L.Icon.Default) {
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            });
        }
    } catch (e) {
        console.error("Leaflet load error", e);
    }
}

// Inject Leaflet CSS
if (typeof document !== 'undefined') {
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
}

const MapView = ({ style, initialRegion, region, children, onRegionChangeComplete, ...props }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [isMounted, setIsMounted] = useState(false);

    const currentRegion = region || initialRegion || {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    useEffect(() => {
        if (!mapRef.current || !L) return;

        if (!mapInstance.current) {
            const zoom = Math.round(Math.log(360 / (currentRegion.latitudeDelta || 0.0922)) / Math.LN2) || 13;
            mapInstance.current = L.map(mapRef.current).setView([currentRegion.latitude, currentRegion.longitude], zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            setIsMounted(true);
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (mapInstance.current && region) {
            mapInstance.current.setView([region.latitude, region.longitude], mapInstance.current.getZoom());
        }
    }, [region]);

    if (Platform.OS !== 'web') return null;

    return (
        <View style={[styles.container, style]}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            {isMounted && children && React.Children.map(children, child => {
                if (!child) return null;
                return React.cloneElement(child, { map: mapInstance.current });
            })}
        </View>
    );
};

export const Marker = ({ coordinate, map, title, ...props }) => {
    const markerInstance = useRef(null);

    useEffect(() => {
        if (!map || !L || !coordinate) return;

        if (!markerInstance.current) {
            markerInstance.current = L.marker([coordinate.latitude, coordinate.longitude]).addTo(map);
            if (title) markerInstance.current.bindPopup(title);
        } else {
            markerInstance.current.setLatLng([coordinate.latitude, coordinate.longitude]);
        }

        return () => {
            if (markerInstance.current) {
                markerInstance.current.remove();
                markerInstance.current = null;
            }
        };
    }, [map, coordinate, title]);

    return null;
};

export const Polyline = ({ coordinates, strokeColor, strokeWidth, map, ...props }) => {
    const polylineInstance = useRef(null);

    useEffect(() => {
        if (!map || !L || !coordinates || coordinates.length < 2) return;

        const positions = coordinates.map(c => [c.latitude, c.longitude]);

        if (!polylineInstance.current) {
            polylineInstance.current = L.polyline(positions, {
                color: strokeColor || '#7B61FF',
                weight: strokeWidth || 3
            }).addTo(map);
        } else {
            polylineInstance.current.setLatLngs(positions);
        }

        return () => {
            if (polylineInstance.current) {
                polylineInstance.current.remove();
                polylineInstance.current = null;
            }
        };
    }, [map, coordinates, strokeColor, strokeWidth]);

    return null;
};

export const Circle = ({ center, radius, fillColor, strokeColor, strokeWidth, map, ...props }) => {
    const circleInstance = useRef(null);

    useEffect(() => {
        if (!map || !L || !center) return;

        if (!circleInstance.current) {
            circleInstance.current = L.circle([center.latitude, center.longitude], {
                radius: radius,
                fillColor: fillColor || '#7B61FF',
                fillOpacity: 0.3,
                color: strokeColor || '#7B61FF',
                weight: strokeWidth || 2
            }).addTo(map);
        } else {
            circleInstance.current.setLatLng([center.latitude, center.longitude]);
            circleInstance.current.setRadius(radius);
        }

        return () => {
            if (circleInstance.current) {
                circleInstance.current.remove();
                circleInstance.current = null;
            }
        };
    }, [map, center, radius, fillColor, strokeColor, strokeWidth]);

    return null;
};

export const PROVIDER_GOOGLE = 'google';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1F2937',
        overflow: 'hidden',
    },
});

export default MapView;
