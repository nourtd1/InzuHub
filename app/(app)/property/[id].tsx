import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Share,
    Linking,
    Platform
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { usePropertyDetail } from '../../../src/hooks/usePropertyDetail';
import { useAuth } from '../../../src/hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { formatPrixMensuel, formatDateRelative, formatPrix } from '../../../src/utils/formatters';

import PhotoGallery from '../../../src/components/property/PhotoGallery';
import SectionTitle from '../../../src/components/property/SectionTitle';
import CaracteristiqueItem from '../../../src/components/property/CaracteristiqueItem';
import Avatar from '../../../src/components/ui/Avatar';
import ReadMoreText from '../../../src/components/ui/ReadMoreText';
import SignalementModal from '../../../src/components/property/SignalementModal';

export default function PropertyDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();

    const {
        property,
        isLoading,
        error,
        isOwnProperty,
        hasReported,
        isContactLoading,
        handleContact,
        handleReport
    } = usePropertyDetail(id as string);

    const [isReportModalVisible, setIsReportModalVisible] = useState(false);

    const handleShare = async () => {
        if (!property) return;
        try {
            await Share.share({
                title: property.titre,
                message: `Logement disponible sur InzuHub : ${property.titre} à ${property.quartier?.nom_quartier} - ${formatPrixMensuel(property.prix_mensuel)}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleCall = () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }
        if (property?.proprietaire?.numero_telephone) {
            Linking.openURL(`tel:${property.proprietaire.numero_telephone}`);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (error || !property) {
        return (
            <View style={styles.centerContainer}>
                <MaterialIcons name="error-outline" size={48} color={COLORS.danger} />
                <Text style={styles.errorText}>{error || 'Propriété introuvable'}</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
                    <Text style={styles.backButtonText}>Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const totalEntree = property.prix_mensuel * (1 + property.garantie_exigee);
    const dateInscription = property.proprietaire?.date_inscription
        ? new Date(property.proprietaire.date_inscription).getFullYear()
        : new Date().getFullYear();

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. Galerie de photos */}
                <PhotoGallery photos={property.photos} propertyTitle={property.titre} />

                {/* Boutons flottants en haut */}
                <View style={styles.floatingHeader}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                        <MaterialIcons name="share" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.body}>
                    {/* SECTION 1 : EN-TÊTE DE L'ANNONCE */}
                    <View style={styles.headerSection}>
                        <View style={styles.statusRow}>
                            <View style={[styles.badge, property.statut === 'loue' ? styles.badgeDanger : property.statut === 'en_cours' ? styles.badgeWarning : styles.badgePrimary]}>
                                <Text style={styles.badgeText}>
                                    {property.statut === 'loue' ? 'Loué' : property.statut === 'en_cours' ? 'En discussion' : 'Disponible'}
                                </Text>
                            </View>
                            <Text style={styles.dateText}>
                                Publié {formatDateRelative(property.date_publication || new Date().toISOString())}
                            </Text>
                        </View>

                        <Text style={styles.title}>{property.titre}</Text>

                        <View style={styles.locationRow}>
                            <MaterialIcons name="location-on" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.locationText}>{property.quartier?.nom_quartier}, Gisenyi</Text>
                        </View>
                    </View>

                    {/* SECTION 2 : PRIX ET GARANTIE */}
                    <View style={styles.priceCard}>
                        <View style={styles.priceRow}>
                            <View>
                                <Text style={styles.priceLabel}>Prix mensuel</Text>
                                <Text style={styles.priceValue}>{formatPrixMensuel(property.prix_mensuel)}</Text>
                            </View>
                            <View style={styles.garantieBlock}>
                                <Text style={styles.priceLabel}>Garantie</Text>
                                <Text style={styles.garantieValue}>{property.garantie_exigee} mois</Text>
                            </View>
                        </View>

                        <View style={styles.totalRow}>
                            <MaterialIcons name="lightbulb-outline" size={16} color={COLORS.primary} />
                            <Text style={styles.totalText}>
                                Total à prévoir à l'entrée : {formatPrix(totalEntree)} (loyer + garantie)
                            </Text>
                        </View>
                    </View>

                    {/* SECTION 3 : CARACTÉRISTIQUES TECHNIQUES */}
                    <SectionTitle title="Caractéristiques" />
                    <View style={styles.featuresGrid}>
                        <View style={styles.featureRow}>
                            <CaracteristiqueItem emoji="🛏" label="Chambres" value={property.nombre_chambres} />
                            <CaracteristiqueItem emoji="🛋" label="Salons" value={property.nombre_salons} />
                        </View>
                        <View style={styles.featureRow}>
                            <CaracteristiqueItem emoji="💧" label="Eau courante" value={property.has_eau} />
                            <CaracteristiqueItem emoji="⚡" label="Électricité" value={property.has_electricite} />
                        </View>
                        <View style={styles.featureRow}>
                            <CaracteristiqueItem emoji="🔒" label="Clôture" value={property.has_cloture} />
                            <CaracteristiqueItem emoji="🚗" label="Parking" value={property.has_parking} />
                        </View>
                    </View>

                    {/* SECTION 4 : DESCRIPTION */}
                    <SectionTitle title="Description" />
                    <ReadMoreText text={property.description} />

                    {/* SECTION 5 : LOCALISATION SUR MINI-CARTE */}
                    <SectionTitle title="Localisation" />
                    {property.latitude && property.longitude ? (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                provider={PROVIDER_DEFAULT}
                                initialRegion={{
                                    latitude: property.latitude as number,
                                    longitude: property.longitude as number,
                                    latitudeDelta: 0.008,
                                    longitudeDelta: 0.008,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                            >
                                <Marker coordinate={{ latitude: property.latitude as number, longitude: property.longitude as number }}>
                                    <View style={styles.mapMarker}>
                                        <MaterialIcons name="home" size={16} color={COLORS.surface} />
                                    </View>
                                </Marker>
                            </MapView>
                            <Text style={styles.mapLocationText}>📍 {property.quartier?.nom_quartier}, Gisenyi, Rwanda</Text>
                            <TouchableOpacity
                                style={styles.mapButton}
                                onPress={() => router.push(`/(app)/(tabs)/map?propertyId=${property.id_propriete}`)}
                            >
                                <Text style={styles.mapButtonText}>Ouvrir dans la carte InzuHub</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <MaterialIcons name="map" size={48} color={COLORS.textSecondary} />
                            <Text style={styles.mapPlaceholderText}>
                                Localisation exacte communiquée lors de la visite
                            </Text>
                        </View>
                    )}

                    {/* SECTION 6 : PROFIL DU PROPRIÉTAIRE */}
                    <SectionTitle title="Propriétaire" style={{ marginTop: SPACING.md }} />
                    <View style={styles.ownerCard}>
                        <View style={styles.ownerHeader}>
                            <Avatar
                                uri={property.proprietaire?.avatar_url}
                                name={property.proprietaire?.nom_complet || 'Propriétaire'}
                                size={56}
                            />
                            <View style={styles.ownerInfo}>
                                <Text style={styles.ownerName}>{property.proprietaire?.nom_complet}</Text>
                                <Text style={styles.ownerRole}>Propriétaire</Text>

                                {property.proprietaire?.statut_verification ? (
                                    <View style={[styles.verifiedBadge, styles.verifiedBg]}>
                                        <MaterialIcons name="check-circle" size={14} color={COLORS.secondary} />
                                        <Text style={styles.verifiedText}>✓ Identité vérifiée par InzuHub</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.verifiedBadge, styles.unverifiedBg]}>
                                        <MaterialIcons name="warning" size={14} color={COLORS.warning} />
                                        <Text style={styles.unverifiedText}>⚠ Identité non vérifiée</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <Text style={styles.memberSince}>Membre depuis {dateInscription}</Text>

                        {!isOwnProperty && (
                            <View style={styles.ownerActions}>
                                <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                                    <MaterialIcons name="phone" size={18} color={COLORS.primary} />
                                    <Text style={styles.callButtonText}>Appeler</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.messageButtonLine}
                                    onPress={handleContact}
                                    disabled={isContactLoading}
                                >
                                    {isContactLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.surface} />
                                    ) : (
                                        <>
                                            <MaterialIcons name="chat-bubble-outline" size={18} color={COLORS.surface} />
                                            <Text style={styles.messageButtonText}>Envoyer message</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* SECTION 7 : SIGNALEMENT */}
                    {!isOwnProperty && (
                        <View style={styles.reportSection}>
                            {hasReported ? (
                                <Text style={styles.reportedText}>
                                    Cette annonce a été signalée à notre équipe.
                                </Text>
                            ) : (
                                <TouchableOpacity onPress={() => setIsReportModalVisible(true)}>
                                    <Text style={styles.reportText}>Signaler cette annonce 🚩</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* BARRE D'ACTION FIXE */}
            <View style={styles.bottomBar}>
                <View style={styles.bottomBarPriceInfo}>
                    <Text style={styles.bottomBarPrice}>{formatPrixMensuel(property.prix_mensuel)}</Text>
                    <Text style={styles.bottomBarGarantie}>Garantie : {property.garantie_exigee} mois</Text>
                </View>

                {!isOwnProperty && (
                    <TouchableOpacity
                        style={styles.bottomBarContactButton}
                        onPress={handleContact}
                        disabled={isContactLoading}
                    >
                        {isContactLoading ? (
                            <ActivityIndicator size="small" color={COLORS.surface} />
                        ) : (
                            <>
                                <MaterialIcons name="chat" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />
                                <Text style={styles.bottomBarContactText}>Contacter</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Modal de signalement */}
            <SignalementModal
                isVisible={isReportModalVisible}
                onClose={() => setIsReportModalVisible(false)}
                onSubmit={handleReport}
            />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
    },
    errorText: {
        marginTop: SPACING.md,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    backButtonInline: {
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    backButtonText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 100, // Espace pour la barre du bas
    },
    floatingHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30, // Safe area approx
        left: SPACING.md,
        right: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    body: {
        padding: SPACING.lg,
    },
    headerSection: {
        marginBottom: SPACING.lg,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.full,
    },
    badgePrimary: {
        backgroundColor: `${COLORS.primary}15`,
    },
    badgeWarning: {
        backgroundColor: `${COLORS.warning}15`,
    },
    badgeDanger: {
        backgroundColor: `${COLORS.danger}15`,
    },
    badgeText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    dateText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: SPACING.sm,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    locationText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    priceCard: {
        backgroundColor: `${COLORS.primary}0D`, // ~5% opacity
        borderWidth: 1,
        borderColor: `${COLORS.primary}33`, // ~20% opacity
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.xl,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    priceLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    priceValue: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    garantieBlock: {
        alignItems: 'flex-end',
    },
    garantieValue: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        fontWeight: '600',
        marginTop: 4,
    },
    totalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.sm,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: `${COLORS.primary}20`,
    },
    totalText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginLeft: 6,
        flex: 1,
    },
    featuresGrid: {
        marginBottom: SPACING.lg,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mapContainer: {
        marginBottom: SPACING.xl,
    },
    map: {
        height: 180,
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.sm,
    },
    mapMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    mapLocationText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    mapButton: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
    },
    mapButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    mapPlaceholder: {
        height: 180,
        backgroundColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        padding: SPACING.lg,
    },
    mapPlaceholderText: {
        marginTop: SPACING.sm,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    ownerCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: SPACING.xl,
    },
    ownerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    ownerInfo: {
        marginLeft: SPACING.md,
        flex: 1,
    },
    ownerName: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    ownerRole: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'flex-start',
    },
    verifiedBg: {
        backgroundColor: `${COLORS.secondary}15`,
    },
    unverifiedBg: {
        backgroundColor: `${COLORS.warning}15`,
    },
    verifiedText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.secondary,
        fontWeight: '600',
        marginLeft: 4,
    },
    unverifiedText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.warning,
        fontWeight: '600',
        marginLeft: 4,
    },
    memberSince: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    ownerActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
    },
    callButtonText: {
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    messageButtonLine: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: SPACING.sm,
    },
    messageButtonText: {
        color: COLORS.surface,
        fontWeight: '600',
        marginLeft: SPACING.xs,
    },
    reportSection: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    reportText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        textDecorationLine: 'underline',
    },
    reportedText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md, // Safe area approx
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomBarPriceInfo: {
        flex: 1,
    },
    bottomBarPrice: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    bottomBarGarantie: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    bottomBarContactButton: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: SPACING.md,
        minWidth: 140,
    },
    bottomBarContactText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
});
