import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostLocationStep } from '../../../src/hooks/usePostLocationStep';
import { usePostPropertyStore } from '../../../src/store/PostPropertyStore';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../../src/constants/theme';
import QuartierCard from '../../../src/components/post/QuartierCard';
import MapPickerModal from '../../../src/components/post/MapPickerModal';
import ToggleCard from '../../../src/components/post/ToggleCard';
import CounterInput from '../../../src/components/post/CounterInput';
import PublishProgressModal from '../../../src/components/post/PublishProgressModal';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function PostLocationStep() {
    const router = useRouter();
    const store = usePostPropertyStore(); // needed for pure read in summary and others
    const progressAnim = useRef(new Animated.Value(50)).current;
    const insets = useSafeAreaInsets();

    const {
        id_quartier, description, nombre_chambres, nombre_salons,
        has_eau, has_electricite, has_cloture, has_parking,
        latitude, longitude, quartiers, selectedQuartier,
        errors, isStepValid, isMapVisible, setIsMapVisible,
        onMapPress, onUseCurrentLocation, setField, setQuartier,
        isPublishing, publishStep, publishError, publishAnnonce, handleGoBack
    } = usePostLocationStep();

    const [showTips, setShowTips] = useState(false);

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: 100, // 100%
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, []);

    const formatPrice = (val: string) => val.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    const countDescChars = description.length;
    const descColor = countDescChars > 900 ? COLORS.danger : COLORS.textSecondary;

    if (publishStep === 3) {
        return (
            <View style={styles.successContainer}>
                <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />
                <Text style={{ fontSize: 72, marginBottom: SPACING.lg }}>🎉</Text>
                <Text style={styles.successTitle}>Annonce publiée avec succès !</Text>
                <Text style={styles.successSubtitle}>
                    Votre logement est maintenant visible par tous les locataires de Gisenyi sur InzuHub.
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.headerBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvelle annonce</Text>
                <Text style={styles.headerStep}>Étape 2 sur 2</Text>
            </View>

            <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* SECTION QUARTIER */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Localisation</Text>
                    <Text style={styles.sectionSubtitle}>Dans quel quartier de Gisenyi se trouve votre logement ?</Text>

                    <View style={styles.quartierGrid}>
                        {quartiers.map(q => (
                            <QuartierCard
                                key={q.id_quartier}
                                quartier={q}
                                isSelected={id_quartier === q.id_quartier}
                                onPress={() => setQuartier(q.id_quartier)}
                            />
                        ))}
                    </View>
                    {errors.id_quartier && <Text style={styles.errorText}>{errors.id_quartier}</Text>}
                </View>

                {/* SECTION CARTE */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Position exacte (optionnel)</Text>
                    <Text style={styles.sectionSubtitle}>Placez une épingle pour aider les locataires à trouver votre logement</Text>

                    <View style={styles.warningBox}>
                        <MaterialIcons name="warning" size={16} color={COLORS.warning} style={{ marginTop: 2, marginRight: 8 }} />
                        <Text style={styles.warningText}>
                            Votre adresse exacte ne sera PAS rendue publique. Seul le quartier sera affiché. La position précise sera partagée uniquement après confirmation de visite.
                        </Text>
                    </View>

                    {!latitude || !longitude ? (
                        <View style={styles.mapActions}>
                            <TouchableOpacity style={styles.mapBtnOutline} onPress={() => setIsMapVisible(true)}>
                                <MaterialIcons name="place" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                                <Text style={styles.mapBtnTextOutline}>Placer sur la carte</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.mapBtnOutline} onPress={onUseCurrentLocation}>
                                <MaterialIcons name="my-location" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                                <Text style={styles.mapBtnTextOutline}>Utiliser ma position actuelle</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.mapPreviewContainer}>
                            {/* Static preview block instead of full mapview to save memory if needed, but styling it nice */}
                            <View style={styles.mapPreviewFake}>
                                <MaterialIcons name="location-pin" size={48} color={COLORS.primary} />
                                <Text style={{ color: COLORS.textSecondary, marginTop: 8 }}>{latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
                            </View>
                            <TouchableOpacity style={styles.mapOverlayEdit} onPress={() => setIsMapVisible(true)}>
                                <MaterialIcons name="edit" size={16} color={COLORS.surface} />
                                <Text style={styles.mapOverlayText}>Modifier</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* SECTION ÉQUIPEMENTS */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Équipements disponibles</Text>
                    <Text style={styles.sectionSubtitle}>Cochez uniquement ce qui est effectivement disponible</Text>

                    <View style={styles.quartierGrid}>
                        <ToggleCard emoji="💧" label="Eau courante" value={has_eau} onToggle={() => setField('has_eau', !has_eau)} activeColor="#0099CC" />
                        <ToggleCard emoji="⚡" label="Électricité" value={has_electricite} onToggle={() => setField('has_electricite', !has_electricite)} activeColor="#FFA502" />
                        <ToggleCard emoji="🔒" label="Clôture" value={has_cloture} onToggle={() => setField('has_cloture', !has_cloture)} activeColor="#2ED573" />
                        <ToggleCard emoji="🚗" label="Parking" value={has_parking} onToggle={() => setField('has_parking', !has_parking)} activeColor="#747D8C" />
                    </View>
                    <Text style={styles.equipmentHint}>
                        💡 Soyez honnête sur les équipements disponibles. Les annonces incorrectes peuvent être signalées et retirées.
                    </Text>
                </View>

                {/* SECTION PIÈCES */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Composition du logement</Text>
                    <View style={styles.countersRow}>
                        <CounterInput
                            label="Chambres"
                            emoji="🛏"
                            value={parseInt(nombre_chambres, 10) || 1}
                            min={1}
                            max={20}
                            onChange={(v) => setField('nombre_chambres', v.toString())}
                        />
                        <CounterInput
                            label="Salons"
                            emoji="🛋"
                            value={parseInt(nombre_salons, 10) || 0}
                            min={0}
                            max={10}
                            onChange={(v) => setField('nombre_salons', v.toString())}
                        />
                    </View>
                    {errors.nombre_chambres && <Text style={styles.errorText}>{errors.nombre_chambres}</Text>}
                    {errors.nombre_salons && <Text style={styles.errorText}>{errors.nombre_salons}</Text>}
                </View>

                {/* SECTION DESCRIPTION */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Description détaillée</Text>
                    <Text style={styles.sectionSubtitle}>Décrivez votre logement en détail pour attirer les bons locataires</Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInputMulti}
                            value={description}
                            onChangeText={(v) => setField('description', v)}
                            placeholder="Décrivez votre logement : l'environnement du quartier, les transports..."
                            placeholderTextColor={COLORS.textSecondary}
                            multiline
                            maxLength={1000}
                            textAlignVertical="top"
                        />
                        <Text style={[styles.charCount, { color: descColor }]}>{countDescChars}/1000</Text>
                    </View>
                    {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

                    <View style={styles.tipsBox}>
                        <TouchableOpacity style={styles.tipsHeader} onPress={() => setShowTips(!showTips)}>
                            <Text style={styles.tipsTitle}>💡 Conseils pour une bonne description</Text>
                            <MaterialIcons name={showTips ? "arrow-drop-up" : "arrow-drop-down"} size={24} color={COLORS.primary} />
                        </TouchableOpacity>

                        {showTips && (
                            <View style={styles.tipsContent}>
                                <Text style={styles.tipItem}>✓ Mentionnez la proximité des transports</Text>
                                <Text style={styles.tipItem}>✓ Précisez si l'eau est disponible 24h/24</Text>
                                <Text style={styles.tipItem}>✓ Indiquez les règles (animaux, fumeurs...)</Text>
                                <Text style={styles.tipItem}>✓ Décrivez l'état général du logement</Text>
                                <Text style={[styles.tipItem, { color: COLORS.danger }]}>✗ N'incluez pas votre numéro de téléphone (les locataires vous contactent via l'app)</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* SECTION RÉCAPITULATIF */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Récapitulatif de votre annonce</Text>

                    <View style={styles.recapCard}>
                        {store.photos.length > 0 && (
                            <View style={styles.recapPhotoContainer}>
                                <Image source={{ uri: store.photos[0]?.uri }} style={styles.recapPhoto} />
                                {store.photos.length > 1 && (
                                    <View style={styles.recapPhotoBadge}>
                                        <Text style={styles.recapPhotoBadgeText}>+ {store.photos.length - 1} autres photos</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.recapContent}>
                            <Text style={styles.recapTitle}>{store.titre || 'Titre non défini'}</Text>
                            <Text style={styles.recapSubtitle}>📍 {selectedQuartier?.nom_quartier || 'Quartier non sélectionné'}, Gisenyi</Text>

                            <View style={styles.recapSpecs}>
                                <Text style={styles.recapSpecText}>🛏 {store.nombre_chambres} ch.  🛋 {store.nombre_salons} sal.</Text>
                            </View>

                            <View style={styles.recapFees}>
                                <Text style={styles.recapPrice}>💰 {formatPrice(store.prix_mensuel || '0')} RWF/mois</Text>
                                {parseInt(store.garantie_exigee) > 0 && (
                                    <Text style={styles.recapGarantie}>🔐 Garantie : {store.garantie_exigee} mois</Text>
                                )}
                            </View>

                            <Text style={styles.recapDesc} numberOfLines={2}>
                                📝 {description || 'Aucune description'}
                            </Text>

                            <TouchableOpacity style={styles.recapEditBtn} onPress={handleGoBack}>
                                <MaterialIcons name="edit" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                                <Text style={styles.recapEditBtnText}>Modifier Étape 1</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {publishError && <Text style={[styles.errorText, { textAlign: 'center', marginBottom: SPACING.md }]}>{publishError}</Text>}

            </ScrollView>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
                <TouchableOpacity
                    style={[styles.publishBtn, (!isStepValid || isPublishing) && { opacity: 0.4 }]}
                    disabled={!isStepValid || isPublishing}
                    onPress={publishAnnonce}
                >
                    <Text style={styles.publishBtnText}>🚀 Publier mon annonce</Text>
                </TouchableOpacity>
            </View>

            <MapPickerModal
                visible={isMapVisible}
                onClose={() => setIsMapVisible(false)}
                onMapPress={onMapPress}
                onUseLocation={onUseCurrentLocation}
                coordinate={latitude && longitude ? { latitude, longitude } : null}
                onConfirm={() => setIsMapVisible(false)}
            />

            <PublishProgressModal visible={isPublishing} step={publishStep} />

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    headerBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    headerStep: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    progressContainer: {
        height: 4,
        backgroundColor: COLORS.border,
        width: '100%',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
        paddingBottom: 40,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    quartierGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.fontSizeXS,
        marginTop: 4,
    },
    warningBox: {
        flexDirection: 'row',
        backgroundColor: `${COLORS.warning}1A`,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    warningText: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textPrimary,
        lineHeight: 18,
    },
    mapActions: {
        gap: SPACING.sm,
    },
    mapBtnOutline: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: 12,
    },
    mapBtnTextOutline: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    mapPreviewContainer: {
        height: 160,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#EAEAEA',
    },
    mapPreviewFake: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlayEdit: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        alignItems: 'center',
    },
    mapOverlayText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    equipmentHint: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 8,
    },
    countersRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputWrapper: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        position: 'relative',
    },
    textInputMulti: {
        minHeight: 150,
        maxHeight: 300,
        padding: SPACING.md,
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
    },
    charCount: {
        position: 'absolute',
        right: 12,
        bottom: 12,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tipsBox: {
        backgroundColor: `${COLORS.primary}0D`,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.md,
        overflow: 'hidden',
    },
    tipsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
    },
    tipsTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    tipsContent: {
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.md,
    },
    tipItem: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    recapCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
    recapPhotoContainer: {
        height: 160,
        width: '100%',
        position: 'relative',
    },
    recapPhoto: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    recapPhotoBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recapPhotoBadgeText: {
        color: COLORS.surface,
        fontSize: 10,
        fontWeight: 'bold',
    },
    recapContent: {
        padding: SPACING.md,
    },
    recapTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    recapSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    recapSpecs: {
        marginBottom: SPACING.md,
    },
    recapSpecText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    recapFees: {
        backgroundColor: `${COLORS.primary}0D`,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    recapPrice: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    recapGarantie: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    recapDesc: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    recapEditBtn: {
        position: 'absolute',
        top: SPACING.md,
        right: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}1A`,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
    },
    recapEditBtnText: {
        fontSize: 12,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    publishBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    publishBtnText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    successContainer: {
        flex: 1,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    successTitle: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.md,
    },
    successSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    }
});
