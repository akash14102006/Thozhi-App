import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebMapView({
    latitude = 13.1320,
    longitude = 80.1994,
    zoom = 15,
    markers = [],
    circles = [],
    style,
    onMapClick
}) {
    const markersHTML = markers.map((marker, index) => `
        L.marker([${marker.latitude}, ${marker.longitude}])
            .addTo(map)
            ${marker.title ? `.bindPopup('<b>${marker.title}</b>')` : ''};
    `).join('\n');

    const circlesHTML = circles.map((circle, index) => `
        L.circle([${circle.center.latitude}, ${circle.center.longitude}], {
            color: '${circle.strokeColor || '#FF0000'}',
            fillColor: '${circle.fillColor || '#FF0000'}',
            fillOpacity: ${circle.fillOpacity || 0.2},
            radius: ${circle.radius || 100}
        }).addTo(map);
    `).join('\n');

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
                const map = L.map('map', {
                    zoomControl: false
                }).setView([${latitude}, ${longitude}], ${zoom});
                
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: ''
                }).addTo(map);
                
                ${markersHTML}
                ${circlesHTML}
                
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
        <View style={[styles.container, style]}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHTML }}
                style={styles.webview}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                scrollEnabled={false}
                onMessage={(event) => {
                    try {
                        const data = JSON.parse(event.nativeEvent.data);
                        if (onMapClick && data.type === 'mapClick') {
                            onMapClick(data.lat, data.lng);
                        }
                    } catch (e) {
                        // Ignore
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
    },
});
