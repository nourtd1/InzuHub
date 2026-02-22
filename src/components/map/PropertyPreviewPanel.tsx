import React, { useEffect, useRef } from 'react';
import { Animated, PanResponder, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MapProperty } from '../../hooks/useMapProperties';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { formatPrixMensuel } from '../../utils/formatters';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const PANEL_HEIGHT = 220; // Adjusted for content

interface PropertyPreviewPanelProps {
    property: MapProperty | null;
    onClose: () => void;
    onViewDetails: (id: string) => void;
}

export default function PropertyPreviewPanel({ property, onClose, onViewDetails }: PropertyPreviewPanelProps) {
    const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50 || gestureState.vy > 1.5) {
                    closePanel();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        friction: 8,
                        tension: 65,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        if (property) {
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 65,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: PANEL_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [property, slideAnim]);

    const closePanel = () => {
        Animated.timing(slideAnim, {
            toValue: PANEL_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }).start(() => onClose());
    };

    if (!property) return null;

    const mainPhoto = property.photos.find(p => p.est_photo_principale) || property.photos[0];
    const imageSource = mainPhoto ? { uri: mainPhoto.url_photo } : require('../../../assets/images/placeholder.png'); // assuming placeholder exists or Expo Image handles bad uris

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
            {...panResponder.panHandlers}
        >
            <View style={styles.handleContainer}>
                <View style={styles.handleBar} />
            </View>

            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.content}
                onPress={() => onViewDetails(property.id_propriete)}
            >
                <Image source={imageSource} style={styles.photo} contentFit="cover" />

                <View style={styles.detailsContainer}>
                    <Text style={styles.title} numberOfLines={1}>{property.titre}</Text>

                    <View style={styles.locationRow}>
                        <MaterialIcons name="location-on" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.locationText} numberOfLines={1}>{property.quartier?.nom_quartier || 'Gisenyi'}</Text>
                    </View>

                    <View style={styles.featuresRow}>
                        <View style={styles.featureItem}>
                            <Ionicons name="bed-outline" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.featureText}>{property.nombre_chambres} ch.</Text>
                        </View>
                        {property.has_eau && (
                            <View style={styles.featureItem}>
                                <Ionicons name="water-outline" size={14} color={COLORS.secondary} />
                                <MaterialIcons name="check" size={12} color={COLORS.secondary} />
                            </View>
                        )}
                        {property.has_electricite && (
                            <View style={styles.featureItem}>
                                <Ionicons name="flash-outline" size={14} color={COLORS.warning} />
                                <MaterialIcons name="check" size={12} color={COLORS.warning} />
                            </View>
                        )}
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>{formatPrixMensuel(property.prix_mensuel)}</Text>
                        <View style={styles.actionButton}>
                            <Text style={styles.actionText}>Détails</Text>
                            <MaterialIcons name="arrow-forward" size={16} color={COLORS.primary} />
                        </View>
                    </View>

                    <View style={styles.ownerRow}>
                        <Text style={styles.ownerText}>👤 {property.proprietaire?.nom_complet}</Text>
                        {property.proprietaire?.statut_verification && (
                            <View style={styles.verifiedBadge}>
                                <MaterialIcons name="check-circle" size={14} color={COLORS.secondary} />
                                <Text style={styles.verifiedText}>Vérifié</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
        paddingBottom: SPACING.lg, // Safe area padding
        height: PANEL_HEIGHT,
        zIndex: 50,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    handleBar: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.border,
    },
    content: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.border,
    },
    detailsContainer: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    locationText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginLeft: 2,
    },
    featuresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        gap: SPACING.sm,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    featureText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SPACING.sm,
    },
    price: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: 2,
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    ownerText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.full,
    },
    verifiedText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.secondary,
        fontWeight: '600',
        marginLeft: 2,
    },
});
