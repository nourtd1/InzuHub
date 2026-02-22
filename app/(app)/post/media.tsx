import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../../src/constants/theme';
import { usePostMediaStep } from '../../../src/hooks/usePostMediaStep';
import PhotoGrid from '../../../src/components/post/PhotoGrid';
import PriceInput from '../../../src/components/post/PriceInput';
import GarantiePicker from '../../../src/components/post/GarantiePicker';

export default function PostMediaStep() {
    const router = useRouter();
    const progressAnim = useRef(new Animated.Value(0)).current;

    const {
        photos, titre, prix_mensuel, garantie_exigee,
        errors, isStepValid,
        pickFromGallery, takePhoto, removePhoto, setMainPhoto, reorderPhotos,
        setTitre, setPrixMensuel, setGarantieExigee,
        goToNextStep
    } = usePostMediaStep();

    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: 50, // 50%
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, []);

    const handleClose = () => {
        Alert.alert(
            "Abandonner l'annonce ?",
            "Vos informations ne seront pas sauvegardées.",
            [
                { text: "Continuer à éditer", style: "cancel" },
                {
                    text: "Abandonner",
                    style: "destructive",
                    onPress: () => {
                        // Ideally we cleanup local temporary store/photos here
                        router.replace('/(app)/(tabs)');
                    }
                }
            ]
        );
    };

    const countTitleChars = titre.length;
    const titleColor = countTitleChars < 60 ? COLORS.textSecondary : countTitleChars <= 75 ? COLORS.warning : COLORS.danger;

    const checkItem = (isValid: boolean, text: string) => (
        <View style={styles.validItemContainer}>
            <MaterialIcons name={isValid ? "check-circle" : "radio-button-unchecked"} size={16} color={isValid ? COLORS.secondary : COLORS.textSecondary} />
            <Text style={[styles.validItemText, { color: isValid ? COLORS.textPrimary : COLORS.textSecondary }]}>{text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                    <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nouvelle annonce</Text>
                <Text style={styles.headerStep}>Étape 1 sur 2</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressBar, { width: progressAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Séction Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos de votre logement</Text>
                    <Text style={styles.sectionSubtitle}>Minimum 3 photos • La première sera la photo principale</Text>

                    {photos.length === 0 ? (
                        <View style={styles.uploadEmptyArea}>
                            <MaterialIcons name="add-a-photo" size={48} color={COLORS.primary} style={{ opacity: 0.5, marginBottom: SPACING.md }} />
                            <Text style={styles.uploadEmptyTitle}>Ajoutez des photos de votre logement</Text>

                            <View style={styles.optionsContainer}>
                                <TouchableOpacity style={styles.optionBtn} onPress={takePhoto}>
                                    <MaterialIcons name="camera-alt" size={20} color={COLORS.textPrimary} />
                                    <Text style={styles.optionText}>Appareil photo</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionBtn} onPress={pickFromGallery}>
                                    <MaterialIcons name="photo-library" size={20} color={COLORS.textPrimary} />
                                    <Text style={styles.optionText}>Galerie</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.uploadLimits}>Formats acceptés : JPG, PNG</Text>
                            <Text style={styles.uploadLimits}>Taille max : 10 MB par photo</Text>
                        </View>
                    ) : (
                        <>
                            <PhotoGrid
                                photos={photos}
                                onRemove={removePhoto}
                                onSetMain={setMainPhoto}
                                onAddPhoto={pickFromGallery}
                            />
                            {/* Option to add more via a button since we have the + grid item as well */}
                            <TouchableOpacity style={styles.addMoreBtn} onPress={pickFromGallery}>
                                <Text style={styles.addMoreText}>Ajouter des photos supplémentaires</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}
                </View>

                {/* Section Informations */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations générales</Text>

                    <Text style={styles.inputLabel}>Titre de l'annonce *</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            value={titre}
                            onChangeText={setTitre}
                            placeholder="Ex: Belle maison 3 chambres avec annexe à Majengo"
                            placeholderTextColor={COLORS.textSecondary}
                            maxLength={80}
                        />
                        <Text style={[styles.charCount, { color: titleColor }]}>{countTitleChars}/80</Text>
                    </View>
                    {errors.titre && <Text style={styles.errorText}>{errors.titre}</Text>}

                    <View style={styles.chipsContainer}>
                        {['Maison 2 chambres', 'Appartement meublé', 'Villa avec parking', 'Studio moderne'].map(chip => (
                            <TouchableOpacity key={chip} style={styles.chip} onPress={() => setTitre(chip)}>
                                <Text style={styles.chipText}>{chip}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Section Prix */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tarification</Text>
                    <Text style={styles.sectionSubtitle}>Définissez un prix clair pour éviter les malentendus</Text>

                    <PriceInput
                        value={prix_mensuel}
                        onChangeText={setPrixMensuel}
                        label="Prix mensuel (RWF) *"
                        error={errors.prix_mensuel}
                        placeholder="Ex: 150000"
                    />

                    <View style={styles.priceTipsBox}>
                        <Text style={styles.priceTipsTitle}>💡 Fourchettes de prix à Gisenyi :</Text>
                        <Text style={styles.priceTipRow}>Studio / 1 ch. :  30 000 - 80 000 RWF</Text>
                        <Text style={styles.priceTipRow}>2 chambres   :  60 000 - 150 000 RWF</Text>
                        <Text style={styles.priceTipRow}>3+ chambres  : 100 000 - 300 000 RWF</Text>
                    </View>

                    <GarantiePicker
                        value={parseInt(garantie_exigee || '0', 10)}
                        onChange={(v) => setGarantieExigee(v.toString())}
                        prixMensuel={parseInt(prix_mensuel || '0', 10) || 0}
                    />
                </View>

                {/* Validation Summary */}
                <View style={[styles.validationSummary, !isStepValid && { borderColor: COLORS.border, borderWidth: 1 }]}>
                    {!isStepValid ? (
                        <>
                            <Text style={styles.validationSummaryTitle}>⚠ Pour continuer, complétez :</Text>
                            {checkItem(photos.length >= 3, `3 photos minimum (actuellement : ${photos.length})`)}
                            {checkItem(titre.length >= 10, "Titre de l'annonce")}
                            {checkItem(parseInt(prix_mensuel || '0', 10) >= 10000, "Prix mensuel valide")}
                        </>
                    ) : (
                        <Text style={[styles.validationSummaryTitle, { color: COLORS.secondary }]}>✨ Étape 1 complète !</Text>
                    )}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextBtn, !isStepValid && { opacity: 0.4 }]}
                    disabled={!isStepValid}
                    onPress={goToNextStep}
                >
                    <Text style={styles.nextBtnText}>Étape suivante : Localisation →</Text>
                </TouchableOpacity>
            </View>
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
    closeBtn: {
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
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
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
    uploadEmptyArea: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}05`,
    },
    uploadEmptyTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginBottom: SPACING.xl,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 10,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    optionText: {
        marginLeft: 8,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '500',
    },
    uploadLimits: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    addMoreBtn: {
        marginTop: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: 12,
        alignItems: 'center',
    },
    addMoreText: {
        color: COLORS.primary,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    inputLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        position: 'relative',
    },
    textInput: {
        height: 48,
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        paddingRight: 40,
    },
    charCount: {
        position: 'absolute',
        right: 12,
        bottom: 14,
        fontSize: 10,
        fontWeight: 'bold',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.fontSizeXS,
        marginTop: 4,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: SPACING.md,
    },
    chip: {
        backgroundColor: `${COLORS.primary}1A`,
        borderRadius: BORDER_RADIUS.full,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    chipText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '500',
    },
    priceTipsBox: {
        backgroundColor: `${COLORS.primary}0D`,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
    },
    priceTipsTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
    },
    priceTipRow: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textPrimary,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        marginBottom: 4,
    },
    validationSummary: {
        backgroundColor: `${COLORS.surface}`,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
    },
    validationSummaryTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    validItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    validItemText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        marginLeft: 8,
    },
    footer: {
        padding: SPACING.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    nextBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    nextBtnText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    }
});
