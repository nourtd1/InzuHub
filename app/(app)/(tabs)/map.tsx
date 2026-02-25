import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Animated, ScrollView } from 'react-native';
import MapView, { PROVIDER_DEFAULT, Region } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLocation } from '../../../src/hooks/useLocation';
import { useMapProperties } from '../../../src/hooks/useMapProperties';
import { GISENYI_POI } from '../../../src/constants/gisenyi_poi';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../../src/constants/theme';

import PropertyMarker from '../../../src/components/map/PropertyMarker';
import POIMarker from '../../../src/components/map/POIMarker';
import PropertyPreviewPanel from '../../../src/components/map/PropertyPreviewPanel';
import RecenterButton from '../../../src/components/map/RecenterButton';

const GISENYI_CENTER: Region = {
    latitude: -1.6975,
    longitude: 29.2566,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export default function MapScreen() {
    const mapRef = useRef<MapView>(null);
    const { userLocation, hasPermission } = useLocation();
    const {
        properties,
        selectedProperty,
        isLoading,
        mapFilters,
        setMapFilters,
        selectProperty,
        visibleCount,
        onRegionChange
    } = useMapProperties();

    const [activeFilter, setActiveFilter] = useState<string>('all');
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    // Show counter animation when count changes
    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visibleCount, fadeAnim]);

    const handleFilterChange = (filterName: string) => {
        setActiveFilter(filterName);
        switch (filterName) {
            case '1_ch':
                setMapFilters({ ...mapFilters, nombre_chambres: 1 });
                break;
            case '2_ch':
                setMapFilters({ ...mapFilters, nombre_chambres: 2 });
                break;
            case '3_ch_plus':
                setMapFilters({ ...mapFilters, nombre_chambres: 3 });
                break;
            case 'eau':
                setMapFilters({ ...mapFilters, has_eau: true, has_electricite: undefined });
                break;
            case 'electricite':
                setMapFilters({ ...mapFilters, has_electricite: true, has_eau: undefined });
                break;
            default: // all
                setMapFilters({ nombre_chambres: undefined, has_eau: undefined, has_electricite: undefined });
                break;
        }
    };

    const handleRecenter = () => {
        mapRef.current?.animateToRegion(GISENYI_CENTER, 1000);
    };

    const handleLocationRecenter = () => {
        if (userLocation) {
            mapRef.current?.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    };

    const handleMarkerPress = (id: string, lat: number, lng: number) => {
        selectProperty(id);
        mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 500);
    };

    const FilterChip = ({ label, id }: { label: string, id: string }) => {
        const isActive = activeFilter === id;
        return (
            <TouchableOpacity
                onPress={() => handleFilterChange(id)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
            >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={GISENYI_CENTER}
                minZoomLevel={Math.log2(360 / 0.15)} // Approximate conversion to zoom level
                maxZoomLevel={Math.log2(360 / 0.002)}
                showsUserLocation={hasPermission}
                showsMyLocationButton={false} // Custom button instead
                onRegionChangeComplete={onRegionChange}
                onPress={() => selectProperty(null)}
            >
                {GISENYI_POI.map(poi => (
                    <POIMarker key={poi.id} poi={poi} />
                ))}

                {properties.map(property => (
                    <PropertyMarker
                        key={property.id_propriete}
                        property={property}
                        isSelected={selectedProperty?.id_propriete === property.id_propriete}
                        onPress={() => handleMarkerPress(
                            property.id_propriete,
                            property.latitude as number,
                            property.longitude as number
                        )}
                    />
                ))}
            </MapView>

            <View style={[styles.topOverlayContainer, { top: Math.max(insets.top, SPACING.md) }]}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={24} color={COLORS.textSecondary} />
                    <Text style={styles.searchText}>Rechercher dans cette zone</Text>
                </View>
            </View>

            <View style={styles.bottomOverlayContainer} pointerEvents="box-none">
                <Animated.View style={[styles.counterBadge, { opacity: fadeAnim }]}>
                    <Text style={styles.counterText}>{visibleCount} logements dans cette zone</Text>
                </Animated.View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    <FilterChip id="all" label="Tous" />
                    <FilterChip id="1_ch" label="1 ch." />
                    <FilterChip id="2_ch" label="2 ch." />
                    <FilterChip id="3_ch_plus" label="3 ch.+" />
                    <FilterChip id="eau" label="💧 Eau" />
                    <FilterChip id="electricite" label="⚡ Électricité" />
                </ScrollView>
            </View>

            <View style={styles.buttonsContainer} pointerEvents="box-none">
                {hasPermission && userLocation && (
                    <RecenterButton
                        icon="my-location"
                        onPress={handleLocationRecenter}
                        style={{ marginBottom: SPACING.md }}
                    />
                )}
                <RecenterButton
                    icon="gps-fixed"
                    onPress={handleRecenter}
                />
            </View>

            <PropertyPreviewPanel
                property={selectedProperty}
                onClose={() => selectProperty(null)}
                onViewDetails={(id) => router.push(`/property/${id}`)}
            />

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Chargement des logements...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    topOverlayContainer: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    searchText: {
        marginLeft: SPACING.sm,
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    bottomOverlayContainer: {
        position: 'absolute',
        bottom: 240, // Above panel
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    counterBadge: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: SPACING.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    counterText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    filtersContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    filterChip: {
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    filterChipActive: {
        backgroundColor: `${COLORS.primary}15`,
        borderColor: COLORS.primary,
    },
    filterChipText: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: COLORS.primary,
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: 250, // Above filters and lower overlays
        right: SPACING.lg,
        zIndex: 15,
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    loadingText: {
        marginTop: SPACING.md,
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
});
