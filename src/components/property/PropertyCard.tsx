import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ProprieteAvecPhotos, Quartier, Utilisateur } from '../../types/database.types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { formatPrixMensuel, formatDateRelative } from '../../utils/formatters';
import { useTranslation } from '../../i18n/useTranslation';
import FavorisButton from '../ui/FavorisButton';

interface PropertyCardProps {
    property: ProprieteAvecPhotos & {
        quartier: Quartier;
        proprietaire: Pick<Utilisateur, 'nom_complet' | 'statut_verification'>;
    };
    onPress: () => void;
}

const blurhash =
    '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuwH';

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { t } = useTranslation();

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
            speed: 20,
            bounciness: 5,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 20,
            bounciness: 5,
        }).start();
    }, [scaleAnim]);

    // Main photo or fallback
    const mainPhotoUrl = property.photos.find(p => p.est_photo_principale)?.url_photo || property.photos[0]?.url_photo;
    const photoCount = property.photos.length;

    // Status Badge Logic
    const getStatusBadge = () => {
        switch (property.statut) {
            case 'disponible':
                return { label: t('property.available'), color: COLORS.secondary };
            case 'en_cours':
                return { label: t('property.in_progress'), color: COLORS.warning };
            case 'loue':
                return { label: t('property.rented'), color: COLORS.danger };
            default:
                return { label: 'Indisponible', color: COLORS.textSecondary };
        }
    };
    const status = getStatusBadge();

    return (
        <TouchableWithoutFeedback
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    {mainPhotoUrl ? (
                        <Image
                            style={styles.image}
                            source={{ uri: mainPhotoUrl }}
                            placeholder={{ blurhash }}
                            contentFit="cover"
                            transition={200}
                        />
                    ) : (
                        <View style={[styles.image, styles.fallbackImage]}>
                            <Ionicons name="home-outline" size={48} color={COLORS.textSecondary} />
                        </View>
                    )}

                    {/* Status Badge */}
                    <View style={[styles.badge, styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.label}</Text>
                    </View>

                    {/* Favoris Button */}
                    <FavorisButton
                        propertyId={property.id_propriete}
                        size="sm"
                        style={styles.favorisButton}
                    />

                    {/* Verified Badge */}
                    {property.proprietaire.statut_verification && (
                        <View style={[styles.badge, styles.verifiedBadge]}>
                            <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                            <Text style={styles.verifiedText}>{t('property.verified')}</Text>
                        </View>
                    )}

                    {/* Photo Count */}
                    {photoCount > 1 && (
                        <View style={styles.photoCountBadge}>
                            <Ionicons name="camera-outline" size={12} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.photoCountText}>{photoCount}</Text>
                        </View>
                    )}
                </View>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {property.titre}
                    </Text>

                    <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.quartierText}>{property.quartier.nom_quartier}</Text>
                    </View>

                    {/* Features Grid */}
                    <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                            <Ionicons name="bed-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.featureText}>{property.nombre_chambres} {t('property.bedrooms').trim()}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="grid-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.featureText}>{property.nombre_salons} {t('property.living_rooms').trim()}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="water" size={16} color={property.has_eau ? COLORS.secondary : COLORS.textSecondary} />
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="flash" size={16} color={property.has_electricite ? COLORS.secondary : COLORS.textSecondary} />
                        </View>
                    </View>

                    {/* Price & Garantie */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{formatPrixMensuel(property.prix_mensuel)}</Text>
                        {property.garantie_exigee > 0 && (
                            <Text style={styles.guaranteeText}>{t('property.guarantee')} : {property.garantie_exigee} {t('property.months')}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* Footer: Owner & Date */}
                    <View style={styles.footer}>
                        <View style={styles.ownerInfo}>
                            <Ionicons name="person-circle-outline" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.ownerName}>{property.proprietaire.nom_complet}</Text>
                        </View>
                        <Text style={styles.dateText}>{formatDateRelative(property.date_publication)}</Text>
                    </View>

                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2, // Elevation 2 equivalent
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden', // Ensure image respects border radius
    },
    imageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
        backgroundColor: '#F0F0F0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    fallbackImage: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E8ECF4',
    },
    badge: {
        position: 'absolute',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusBadge: {
        top: SPACING.sm,
        left: SPACING.sm,
    },
    favorisButton: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    verifiedBadge: {
        top: SPACING.sm,
        left: SPACING.sm,
        backgroundColor: '#FFFFFF',
    },
    photoCountBadge: {
        position: 'absolute',
        bottom: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    verifiedText: {
        color: COLORS.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    photoCountText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    contentContainer: {
        padding: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG, // Slightly larger looking for title
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    quartierText: {
        marginLeft: 4,
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '500',
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Distribute evenly
        marginBottom: SPACING.md,
        backgroundColor: COLORS.background, // Subtle background for features row? No, prompt didn't say.
        // Let's keep it simple as per visual diagram
        // The diagram showed: [Bed] [Sofa] [Water] [Electricity] in a row
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    featureText: {
        marginLeft: 6,
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '500',
    },
    priceContainer: {
        marginBottom: 4, // Tight spacing
    },
    priceText: {
        color: COLORS.primary,
        fontSize: 17, // Large
        fontWeight: 'bold',
    },
    guaranteeText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeXS,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    ownerName: {
        marginLeft: 6,
        color: COLORS.textPrimary, // Or Secondary? "Jean Habimana"
        fontSize: TYPOGRAPHY.fontSizeXS + 1,
        fontWeight: '500',
    },
    dateText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeXS,
    },
});
