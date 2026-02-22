import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { ProprieteAvecPhotos, Quartier, Utilisateur } from '../../types/database.types';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { formatPrixCourt } from '../../utils/formatters';
import { MaterialIcons } from '@expo/vector-icons';

export interface PropertyMarkerProps {
    property: ProprieteAvecPhotos & {
        quartier: Quartier;
        proprietaire: Pick<Utilisateur, 'nom_complet' | 'statut_verification'>;
    };
    isSelected: boolean;
    onPress: () => void;
}

export default function PropertyMarker({ property, isSelected, onPress }: PropertyMarkerProps) {
    const scaleAnim = useRef(new Animated.Value(isSelected ? 1.2 : 1)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: isSelected ? 1.2 : 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    }, [isSelected, scaleAnim]);

    const getBackgroundColor = () => {
        if (property.statut === 'en_cours') return COLORS.warning;
        if (property.statut === 'loue') return COLORS.danger;
        return COLORS.primary; // disponible
    };

    const bgColor = getBackgroundColor();

    if (!property.latitude || !property.longitude) return null;

    return (
        <Marker
            coordinate={{ latitude: property.latitude, longitude: property.longitude }}
            onPress={onPress}
            tracksViewChanges={false}
            zIndex={isSelected ? 10 : 1}
        >
            <Animated.View style={[
                styles.markerContainer,
                {
                    transform: [{ scale: scaleAnim }],
                    shadowRadius: isSelected ? 6 : 3,
                    shadowOpacity: isSelected ? 0.4 : 0.2,
                    elevation: isSelected ? 8 : 4,
                }
            ]}>
                <View style={[styles.bubble, { backgroundColor: bgColor }]}>
                    <Text style={styles.priceText} numberOfLines={1}>
                        {formatPrixCourt(property.prix_mensuel)}
                    </Text>
                    {property.proprietaire?.statut_verification && (
                        <View style={styles.badgeContainer}>
                            <View style={styles.verifiedBadge}>
                                <MaterialIcons name="check" size={8} color={COLORS.primary} />
                            </View>
                        </View>
                    )}
                </View>
                <View style={[styles.triangle, { borderTopColor: bgColor }]} />
            </Animated.View>
        </Marker>
    );
}

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
    },
    bubble: {
        minWidth: 72,
        height: 32,
        borderRadius: 8,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    priceText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        padding: 2,
    },
    verifiedBadge: {
        backgroundColor: COLORS.surface,
        width: 12,
        height: 12,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 0,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        // borderTopColor est défini dynamiquement
    },
});
