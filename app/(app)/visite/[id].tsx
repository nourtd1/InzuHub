import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Linking, Platform, Animated } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { useVisiteDetail } from '../../../src/hooks/useVisiteDetail';
import { formatPrix } from '../../../src/utils/formatters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../../../src/components/ui/Avatar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../../../src/hooks/useAuth';
import { useAvis } from '../../../src/hooks/useAvis';
import AvisModal from '../../../src/components/avis/AvisModal';
import { useTranslation } from '../../../src/i18n/useTranslation';

export default function VisiteDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const {
        visite,
        isLoading,
        isCurrentUserLocataire,
        isCurrentUserProprietaire,
        isVisiteFuture,
        timeUntilVisite,
        isConfirming,
        isCancelling,
        confirmerVisite,
        annulerVisite,
        addToCalendar,
        shareVisite
    } = useVisiteDetail(id as string);
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { myAvis, canReview, checkReviewEligibility, submitAvis, isSubmitting, deleteMyAvis } = useAvis();
    const [isAvisModalVisible, setAvisModalVisible] = useState(false);

    const pulseAnim = useRef(new Animated.Value(timeUntilVisite?.includes('C\'est aujourd\'hui') ? 1.2 : 1)).current;

    useEffect(() => {
        if (timeUntilVisite?.includes('C\'est aujourd\'hui')) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [timeUntilVisite]);

    useEffect(() => {
        if (user?.id && visite?.id_visite && visite.statut === 'confirmee' && new Date(visite.date_visite) < new Date() && isCurrentUserLocataire) {
            checkReviewEligibility(user.id, visite.id_visite);
        }
    }, [user?.id, visite?.id_visite, visite?.statut, visite?.date_visite, isCurrentUserLocataire]);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!visite || !visite.conversation) {
        return (
            <View style={styles.centerContainer}>
                <Text>Visite introuvable</Text>
            </View>
        );
    }

    const { propriete } = visite.conversation;
    const interlocuteur = isCurrentUserLocataire ? visite.conversation.proprietaire : visite.conversation.locataire;
    const isProposee = visite.statut === 'proposee';
    const isAnnulee = visite.statut === 'annulee';

    const renderHero = () => {
        let bgColor = COLORS.secondary;
        let icon = 'check-circle';
        let title = 'Visite Confirmée !';
        let subtitle = 'Les deux parties ont accepté ce rendez-vous. Bonne visite !';

        if (isProposee) {
            bgColor = COLORS.warning;
            icon = 'hourglass-empty';
            title = 'En attente de confirmation';
            subtitle = 'L\'autre partie n\'a pas encore répondu.';
        } else if (isAnnulee) {
            bgColor = COLORS.danger;
            icon = 'cancel';
            title = 'Visite Annulée';
            subtitle = 'Cette visite a été annulée.';
        }

        return (
            <View style={[styles.hero, { backgroundColor: bgColor }]}>
                <MaterialIcons name={icon as any} size={48} color={COLORS.surface} style={{ marginBottom: 12 }} />
                <Text style={styles.heroTitle}>{title}</Text>
                <Text style={styles.heroSubtitle}>{subtitle}</Text>

                {visite.statut === 'confirmee' && timeUntilVisite && (
                    <Animated.View style={[styles.countdownBadge, { transform: [{ scale: pulseAnim }] }]}>
                        <Text style={styles.countdownText}>{timeUntilVisite}</Text>
                    </Animated.View>
                )}

                {visite.statut === 'confirmee' && !timeUntilVisite && (
                    <View style={styles.countdownBadge}>
                        <Text style={styles.countdownText}>Cette visite a eu lieu le {format(new Date(visite.date_visite), 'd MMM yyyy')}</Text>
                    </View>
                )}
            </View>
        );
    };

    const openItineraire = () => {
        const addr = `${propriete.quartier?.nom_quartier}+Gisenyi+Rwanda`;
        const lat = propriete.latitude;
        const lng = propriete.longitude;

        let mapsUrl = `https://www.google.com/maps/search/${addr}`;
        if (lat && lng) {
            mapsUrl = Platform.select({
                ios: `maps:?daddr=${lat},${lng}`,
                android: `geo:${lat},${lng}?q=${lat},${lng}`,
                default: mapsUrl
            });
        }
        Linking.openURL(mapsUrl);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 50) }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Détails de la visite</Text>
                <TouchableOpacity onPress={shareVisite} style={styles.headerIconBtn}>
                    <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {renderHero()}

                <View style={styles.content}>
                    {/* Review Banner for Locataire */}
                    {canReview && !myAvis && (
                        <View style={styles.reviewBanner}>
                            <Text style={styles.reviewBannerTitle}>{t('reviews.leave_review_banner')}</Text>
                            <Text style={styles.reviewBannerSub}>{t('reviews.leave_review_subtitle')}</Text>
                            <TouchableOpacity style={styles.reviewCta} onPress={() => setAvisModalVisible(true)}>
                                <Text style={styles.reviewCtaText}>{t('reviews.leave_review_cta')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Existing Review */}
                    {myAvis && (
                        <View style={styles.existingReview}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.reviewBannerTitle}>{t('reviews.your_review')}</Text>
                                <TouchableOpacity onPress={() => {
                                    Alert.alert(
                                        t('reviews.delete_confirm'),
                                        '',
                                        [
                                            { text: t('common.cancel'), style: 'cancel' },
                                            { text: t('common.yes'), style: 'destructive', onPress: () => deleteMyAvis(myAvis.id_avis) }
                                        ]
                                    );
                                }}>
                                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                {[...Array(5)].map((_, i) => (
                                    <Ionicons key={i} name={i < myAvis.note ? 'star' : 'star-outline'} size={16} color={COLORS.warning} />
                                ))}
                            </View>
                            {myAvis.commentaire && (
                                <Text style={styles.reviewComment}>"{myAvis.commentaire}"</Text>
                            )}
                        </View>
                    )}

                    {/* Infos Visite */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>📅 Date et heure</Text>
                        <View style={styles.divider} />
                        <Text style={styles.infoText}>📆 {format(new Date(visite.date_visite), "EEEE d MMMM yyyy", { locale: fr })}</Text>
                        <Text style={styles.infoText}>⏰ {format(new Date(visite.date_visite), "HH'h'mm")} → ~{format(new Date(new Date(visite.date_visite).getTime() + 3600000), "HH'h'mm")} (1 heure estimée)</Text>

                        <View style={{ height: 20 }} />

                        <Text style={styles.sectionTitle}>📍 Localisation</Text>
                        <View style={styles.divider} />
                        <Text style={styles.infoText}>Quartier {propriete.quartier?.nom_quartier}, Gisenyi</Text>

                        <View style={styles.mapPseudo}>
                            <MaterialIcons name="map" size={32} color={COLORS.textSecondary} />
                        </View>
                        <TouchableOpacity style={styles.outlineBtn} onPress={openItineraire}>
                            <Text style={styles.outlineBtnText}>Itinéraire →</Text>
                        </TouchableOpacity>

                        <View style={{ height: 20 }} />

                        <Text style={styles.sectionTitle}>🔖 Référence visite</Text>
                        <Text style={styles.infoSubText}>#{visite.id_visite.slice(0, 8).toUpperCase()}</Text>
                        <Text style={styles.infoSubNote}>(pour référencer en cas de problème)</Text>
                    </View>

                    {/* Logement */}
                    <TouchableOpacity style={styles.propertyCard} onPress={() => router.push(`/property/${propriete.id_propriete}`)}>
                        <Image
                            source={{ uri: propriete.photos?.[0]?.url_photo || 'https://via.placeholder.com/80' }}
                            style={styles.propertyThumbnail}
                        />
                        <View style={styles.propertyInfo}>
                            <Text style={styles.propertyTitle} numberOfLines={1}>{propriete.titre}</Text>
                            <Text style={styles.propertyPrice}>💰 {formatPrix(propriete.prix_mensuel)}</Text>
                            <Text style={styles.propertyMeta}>📍 {propriete.quartier?.nom_quartier}</Text>
                            <Text style={styles.propertyMeta}>🛏 {propriete.nombre_chambres}ch {propriete.has_electricite ? '⚡✓' : ''} {propriete.has_eau ? '💧✓' : ''}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                    </TouchableOpacity>

                    {/* Interlocuteur */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>{isCurrentUserLocataire ? 'Votre propriétaire' : 'Votre locataire'}</Text>
                        <View style={styles.divider} />

                        <View style={styles.userRow}>
                            <Avatar uri={interlocuteur.avatar_url} name={interlocuteur.nom_complet || ''} size={56} />
                            <View style={styles.userInfo}>
                                <Text style={styles.userName}>{interlocuteur.nom_complet}</Text>
                                {(interlocuteur as any).statut_verification ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <MaterialIcons name="verified" size={14} color={COLORS.secondary} />
                                        <Text style={{ fontSize: 12, color: COLORS.secondary, marginLeft: 2 }}>Vérifié</Text>
                                    </View>
                                ) : (
                                    <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>⚠ Non vérifié</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.rowButtons}>
                            <TouchableOpacity style={styles.flexBtn} onPress={() => Linking.openURL(`tel:${interlocuteur.numero_telephone}`)}>
                                <MaterialIcons name="phone" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                                <Text style={styles.flexBtnText}>Appeler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.flexBtn} onPress={() => router.push(`/chat/${visite.id_conversation}`)}>
                                <MaterialIcons name="chat" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
                                <Text style={styles.flexBtnText}>Message</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.warningNote}>
                            <Text style={styles.warningNoteText}>
                                <Text style={{ fontWeight: 'bold' }}>📌 InzuHub ne sera jamais impliqué dans votre transaction financière. </Text>
                                Effectuez vos paiements directement et en personne.
                            </Text>
                        </View>
                    </View>

                    {/* Préparatifs */}
                    {visite.statut === 'confirmee' && isVisiteFuture && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>💡 Conseils pour votre visite</Text>
                            <View style={styles.divider} />

                            {isCurrentUserLocataire ? (
                                <>
                                    <Conseil type="ok" text="Arrivez 5 minutes avant l'heure prévue" />
                                    <Conseil type="ok" text="Apportez une pièce d'identité valide" />
                                    <Conseil type="ok" text="Préparez vos questions sur le logement" />
                                    <Conseil type="ok" text="Vérifiez l'état de l'eau, l'électricité et les prises" />
                                    <Conseil type="ok" text="Demandez à voir tous les espaces (cuisine, WC, etc.)" />
                                    <Conseil type="ok" text="Renseignez-vous sur les voisins et la sécurité" />
                                    <Conseil type="warn" text="Ne payez aucune somme avant la signature d'un contrat officiel" />
                                </>
                            ) : (
                                <>
                                    <Conseil type="ok" text="Assurez-vous que le logement est propre et accessible" />
                                    <Conseil type="ok" text="Préparez les documents du titre de propriété ou preuve" />
                                    <Conseil type="ok" text="Soyez présent ou désignez un représentant fiable" />
                                    <Conseil type="ok" text="Clarifiez les modalités de paiement à l'avance" />
                                    <Conseil type="warn" text="Ne demandez aucune avance avant la visite elle-même" />
                                </>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 34) }]}>
                {visite.statut === 'confirmee' && isVisiteFuture && (
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={[styles.mainBtn, styles.mainBtnOutline]} onPress={addToCalendar}>
                            <Text style={styles.mainBtnOutlineText}>📅 Ajouter au calendrier</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.ghostBtn} onPress={annulerVisite} disabled={isCancelling}>
                            <Text style={styles.ghostBtnTextDanger}>{isCancelling ? 'En cours...' : '❌ Annuler la visite'}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {visite.statut === 'confirmee' && !isVisiteFuture && (
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={styles.mainBtn} onPress={() => router.push(`/chat/${visite.id_conversation}`)}>
                            <Text style={styles.mainBtnText}>💬 Retour au chat</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {visite.statut === 'proposee' && !isCurrentUserLocataire && (
                    <View style={{ flexDirection: 'row', width: '100%' }}>
                        <TouchableOpacity style={[styles.mainBtn, styles.mainBtnOutline, { flex: 1, marginRight: 8 }]} onPress={annulerVisite} disabled={isCancelling}>
                            <Text style={styles.ghostBtnTextDanger}>✗ Refuser</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.mainBtn, { flex: 1, marginLeft: 8 }]} onPress={confirmerVisite} disabled={isConfirming}>
                            {isConfirming ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.mainBtnText}>✓ Confirmer</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {visite.statut === 'proposee' && isCurrentUserLocataire && (
                    <View style={{ width: '100%' }}>
                        <TouchableOpacity style={styles.ghostBtn} onPress={annulerVisite} disabled={isCancelling}>
                            <Text style={styles.ghostBtnTextDanger}>Annuler la proposition</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {visite.statut === 'annulee' && (
                    <View style={{ width: '100%' }}>
                        {/* Note: In a real app we would open VisiteWidget here, but we pass router push instead to let them go to chat to trigger it */}
                        <TouchableOpacity style={styles.mainBtn} onPress={() => router.push(`/chat/${visite.id_conversation}`)}>
                            <Text style={styles.mainBtnText}>📅 Proposer une nouvelle date (via le chat)</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
            <AvisModal
                isVisible={isAvisModalVisible}
                visite={visite}
                onClose={() => setAvisModalVisible(false)}
                onSubmit={async (data) => {
                    await submitAvis(data);
                    setAvisModalVisible(false);
                }}
                isSubmitting={isSubmitting}
            />
        </View>
    );
}

const Conseil = ({ type, text }: { type: 'ok' | 'warn', text: string }) => (
    <View style={[styles.conseilRow, type === 'warn' && styles.conseilWarn]}>
        <MaterialIcons
            name={type === 'ok' ? 'check-circle' : 'warning'}
            size={20}
            color={type === 'ok' ? COLORS.secondary : COLORS.warning}
            style={{ marginTop: 2 }}
        />
        <Text style={styles.conseilText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerIconBtn: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    hero: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: SPACING.lg,
    },
    heroTitle: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.surface,
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        maxWidth: '90%',
    },
    countdownBadge: {
        marginTop: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    countdownText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    },
    content: {
        padding: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.sm,
    },
    infoText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        marginBottom: 6,
    },
    infoSubText: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginTop: SPACING.xs,
    },
    infoSubNote: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    mapPseudo: {
        height: 100,
        backgroundColor: '#e5e5e5',
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: SPACING.sm,
    },
    outlineBtn: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: 10,
        alignItems: 'center',
        marginTop: 4,
    },
    outlineBtnText: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    propertyCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.sm,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    propertyThumbnail: {
        width: 80,
        height: 80,
        borderRadius: BORDER_RADIUS.md,
    },
    propertyInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    propertyTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    propertyPrice: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    propertyMeta: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: SPACING.md,
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    rowButtons: {
        flexDirection: 'row',
        marginTop: SPACING.md,
    },
    flexBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: 4,
    },
    flexBtnText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    warningNote: {
        backgroundColor: `${COLORS.warning}1A`,
        borderColor: COLORS.warning,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginTop: SPACING.md,
    },
    warningNoteText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        lineHeight: 18,
    },
    conseilRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SPACING.xs,
        paddingHorizontal: 4,
    },
    conseilWarn: {
        backgroundColor: `${COLORS.warning}0D`,
        borderRadius: 4,
    },
    conseilText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
        flex: 1,
        lineHeight: 20,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        paddingBottom: 34,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    mainBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainBtnOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    mainBtnText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    mainBtnOutlineText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    ghostBtn: {
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    ghostBtnTextDanger: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '500',
    },
    reviewBanner: {
        backgroundColor: `${COLORS.primary}0D`,
        borderColor: `${COLORS.primary}33`,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    reviewBannerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    reviewBannerSub: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    reviewCta: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        paddingVertical: 8,
        borderRadius: 20,
    },
    reviewCtaText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    existingReview: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
    },
    reviewComment: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
        fontStyle: 'italic',
    }
});
