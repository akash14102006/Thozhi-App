/**
 * Google Maps Platform APIs Service
 * Uses REST APIs (not native SDK) for maximum compatibility
 */

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

export const GoogleMapsService = {

    /**
     * Get route between two points using Routes API (NEW)
     * Better than Directions API - includes real-time traffic
     */
    async getRoute(origin, destination, options = {}) {
        try {
            const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs'
                },
                body: JSON.stringify({
                    origin: {
                        location: {
                            latLng: {
                                latitude: origin.latitude,
                                longitude: origin.longitude
                            }
                        }
                    },
                    destination: {
                        location: {
                            latLng: {
                                latitude: destination.latitude,
                                longitude: destination.longitude
                            }
                        }
                    },
                    travelMode: options.travelMode || 'DRIVE',
                    routingPreference: 'TRAFFIC_AWARE',
                    computeAlternativeRoutes: true,
                    routeModifiers: {
                        avoidTolls: options.avoidTolls || false,
                        avoidHighways: options.avoidHighways || false,
                        avoidFerries: options.avoidFerries || false
                    }
                })
            });

            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
                throw new Error('No routes found');
            }

            return {
                success: true,
                routes: data.routes.map(route => ({
                    duration: route.duration,
                    distance: route.distanceMeters,
                    polyline: route.polyline.encodedPolyline,
                    legs: route.legs
                }))
            };
        } catch (error) {
            console.error('[Google Routes API] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Find nearby places (police stations, hospitals, etc.)
     */
    async findNearbyPlaces(location, type, radius = 5000) {
        try {
            const url = `https://places.googleapis.com/v1/places:searchNearby`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.rating'
                },
                body: JSON.stringify({
                    locationRestriction: {
                        circle: {
                            center: {
                                latitude: location.latitude,
                                longitude: location.longitude
                            },
                            radius: radius
                        }
                    },
                    includedTypes: [type],
                    maxResultCount: 20
                })
            });

            const data = await response.json();

            return {
                success: true,
                places: data.places || []
            };
        } catch (error) {
            console.error('[Google Places API] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Calculate distances between multiple origins and destinations
     */
    async getDistanceMatrix(origins, destinations, mode = 'driving') {
        try {
            const originsStr = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
            const destStr = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');

            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destStr}&mode=${mode}&key=${GOOGLE_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK') {
                throw new Error(data.error_message || 'Distance Matrix API error');
            }

            return {
                success: true,
                distances: data.rows.map((row, i) => ({
                    origin: origins[i],
                    destinations: row.elements.map((element, j) => ({
                        destination: destinations[j],
                        distance: element.distance,
                        duration: element.duration,
                        status: element.status
                    }))
                }))
            };
        } catch (error) {
            console.error('[Google Distance Matrix] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Geocode address to coordinates
     */
    async geocodeAddress(address) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK') {
                throw new Error(data.error_message || 'Geocoding failed');
            }

            const result = data.results[0];
            return {
                success: true,
                location: {
                    latitude: result.geometry.location.lat,
                    longitude: result.geometry.location.lng
                },
                formattedAddress: result.formatted_address
            };
        } catch (error) {
            console.error('[Google Geocoding] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Reverse geocode coordinates to address
     */
    async reverseGeocode(latitude, longitude) {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status !== 'OK') {
                throw new Error(data.error_message || 'Reverse geocoding failed');
            }

            return {
                success: true,
                address: data.results[0].formatted_address,
                addressComponents: data.results[0].address_components
            };
        } catch (error) {
            console.error('[Google Reverse Geocoding] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Snap GPS coordinates to nearest road
     */
    async snapToRoads(points) {
        try {
            const path = points.map(p => `${p.latitude},${p.longitude}`).join('|');
            const url = `https://roads.googleapis.com/v1/snapToRoads?path=${path}&interpolate=true&key=${GOOGLE_API_KEY}`;

            const response = await fetch(url);
            const data = await response.json();

            return {
                success: true,
                snappedPoints: data.snappedPoints.map(sp => ({
                    latitude: sp.location.latitude,
                    longitude: sp.location.longitude,
                    originalIndex: sp.originalIndex,
                    placeId: sp.placeId
                }))
            };
        } catch (error) {
            console.error('[Google Roads API] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get location from cell towers/WiFi (when GPS weak)
     */
    async getGeolocation(cellTowers = [], wifiAccessPoints = []) {
        try {
            const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    considerIp: true,
                    cellTowers,
                    wifiAccessPoints
                })
            });

            const data = await response.json();

            return {
                success: true,
                location: {
                    latitude: data.location.lat,
                    longitude: data.location.lng
                },
                accuracy: data.accuracy
            };
        } catch (error) {
            console.error('[Google Geolocation] Error:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Find nearest police station
     */
    async findNearestPoliceStation(location) {
        const result = await this.findNearbyPlaces(location, 'police', 5000);
        if (result.success && result.places.length > 0) {
            // Calculate distances and sort
            const placesWithDistance = result.places.map(place => {
                const distance = this.calculateDistance(
                    location.latitude,
                    location.longitude,
                    place.location.latitude,
                    place.location.longitude
                );
                return { ...place, distance };
            });

            placesWithDistance.sort((a, b) => a.distance - b.distance);
            return { success: true, station: placesWithDistance[0] };
        }
        return { success: false, error: 'No police stations found' };
    },

    /**
     * Helper: Calculate distance between two points (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }
};

export default GoogleMapsService;
