import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import MapView, { Marker, LatLng, Region } from 'react-native-maps';

interface MapPickerModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onMapPress: (coord: LatLng) => void;
    onUseLocation: () => Promise<void>;
    coordinate: LatLng | null;
}

export default function MapPickerModal({ visible, onClose, onConfirm, onMapPress, onUseLocation, coordinate }: MapPickerModalProps) {
    const mapRef = React.useRef<MapView>(null);
    const [showHint, setShowHint] = React.useState(true);

    const initialRegion: Region = {
        latitude: -1.6975,
        longitude: 29.2566,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const handleMapPress = (e: any) => {
        if (showHint) setShowHint(false);
        onMapPress(e.nativeEvent.coordinate);
    };

    const centerCurrentLocation = async () => {
        await onUseLocation();
        // Assume context parent fetched it, or we await it taking long here. 
        // For standard UI, if coordinate is set, we can animate.
        setTimeout(() => {
            if (coordinate && mapRef.current) {
                mapRef.current.animateToRegion({
                    ...coordinate,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                });
            }
        }, 800);
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                        <Text style={styles.headerBtnTextLeft}>Annuler</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Position du logement</Text>
                    <TouchableOpacity onPress={onConfirm} style={styles.headerBtn} disabled={!coordinate}>
                        <Text style={[styles.headerBtnTextRight, !coordinate && { color: COLORS.textSecondary }]}>Confirmer</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={initialRegion}
                        onPress={handleMapPress}
                        showsUserLocation={true}
                    >
                        {coordinate && (
                            <Marker coordinate={coordinate}>
                                <View style={styles.markerContainer}>
                                    <View style={styles.markerPin}>
                                        <MaterialIcons name="home" size={20} color={COLORS.surface} />
                                    </View>
                                    <View style={styles.markerTriangle} />
                                </View>
                            </Marker>
                        )}
                    </MapView>

                    {showHint && (
                        <View style={styles.hintContainer}>
                            <Text style={styles.hintText}>👆 Tapez sur la carte pour placer votre logement</Text>
                        </View>
                    )}

                    <TouchableOpacity style={styles.locationBtn} onPress={centerCurrentLocation}>
                        <MaterialIcons name="my-location" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.surface,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerBtn: {
        padding: SPACING.xs,
    },
    headerBtnTextLeft: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    headerBtnTextRight: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    mapContainer: {
        flex: 1,
        position: 'relative',
    },
    map: {
        flex: 1,
    },
    hintContainer: {
        position: 'absolute',
        top: SPACING.xl,
        alignSelf: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    hintText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
    },
    locationBtn: {
        position: 'absolute',
        bottom: 40,
        right: SPACING.lg,
        backgroundColor: COLORS.surface,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 4,
    },
    markerContainer: {
        alignItems: 'center',
    },
    markerPin: {
        backgroundColor: COLORS.primary,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerTriangle: {
        width: 0,
        height: 0,
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: COLORS.primary,
        transform: [{ rotate: "180deg" }],
        marginTop: -1,
    }
});
