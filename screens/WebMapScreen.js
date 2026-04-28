import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

export default function WebMapScreen({ route }) {
    const { latitude = 13.1320, longitude = 80.1994, zoom = 13 } = route?.params || {};

    const mapHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { width: 100vw; height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
                
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(map);
                
                // Add marker
                const marker = L.marker([${latitude}, ${longitude}]).addTo(map);
                marker.bindPopup('<b>Your Location</b>').openPopup();
                
                // Send location updates to React Native
                map.on('click', function(e) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapClick',
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    }));
                });
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHTML }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        console.log('Map clicked:', data);
                    } catch (e) {
                        console.log('Map message:', event.nativeEvent.data);
                    }
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
        width: width,
        height: height,
    },
});
