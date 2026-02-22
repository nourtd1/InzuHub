import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../src/constants/theme';
import { useKyc } from '../../src/hooks/useKyc';
import { useRouter } from 'expo-router';
import KycStatusScreen from '../../src/components/kyc/KycStatusScreen';
import KycStepIndicator from '../../src/components/kyc/KycStepIndicator';
import CaptureFrame from '../../src/components/kyc/CaptureFrame';

export default function KycScreen() {
    const router = useRouter();
    const {
        kycDemande,
        isLoading,
        currentStep,
        setStep,
        photoRecto,
        photoVerso,
        photoSelfie,
        setPhotoRecto,
        setPhotoVerso,
        setPhotoSelfie,
        retakeRecto,
        retakeVerso,
        retakeSelfie,
        isSubmitting,
        submitKyc,
        canSubmit
    } = useKyc();

    const [legalChecked, setLegalChecked] = useState(false);

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (kycDemande) {
        return <KycStatusScreen demande={kycDemande} onResubmit={() => { /* Supabase rule deletes old rejected row, so frontend simply state-resets here */ router.replace('/kyc') }} />;
    }

    const renderHeader = (title: string, showIndicator = true) => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => currentStep === 'intro' || currentStep === 'submitted' ? router.back() : setStep(getPrevStep(currentStep))} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            {showIndicator && <View style={{ width: 24 }} />}
        </View>
    );

    const getPrevStep = (step: string) => {
        if (step === 'recto') return 'intro';
        if (step === 'verso') return 'recto';
        if (step === 'selfie') return 'verso';
        if (step === 'review') return 'selfie';
        return 'intro';
    };

    const getCompletedSteps = () => {
        const completed = [];
        if (photoRecto) completed.push(1);
        if (photoVerso) completed.push(2);
        if (photoSelfie) completed.push(3);
        return completed;
    };

    if (currentStep === 'intro') {
        return (
            <View style={styles.container}>
                {renderHeader("Vérification d'identité", false)}
                <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.heroEmoji}>🪪</Text>
                    <Text style={styles.introTitle}>Certifiez votre identité</Text>
                    <Text style={styles.introSubtitle}>
                        La vérification d'identité permet à InzuHub de certifier que vous êtes une vraie personne.
                        Cela protège tous les utilisateurs contre les arnaques.
                    </Text>

                    <Text style={styles.sectionTitle}>Ce dont vous avez besoin :</Text>
                    <View style={styles.listContainer}>
                        <View style={styles.listItem}><MaterialIcons name="check" size={20} color={COLORS.secondary} /><Text style={styles.listText}>Votre carte d'identité rwandaise</Text></View>
                        <View style={styles.listItem}><MaterialIcons name="check" size={20} color={COLORS.secondary} /><Text style={styles.listText}>Un bon éclairage</Text></View>
                        <View style={styles.listItem}><MaterialIcons name="check" size={20} color={COLORS.secondary} /><Text style={styles.listText}>2 minutes de votre temps</Text></View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Ce que nous faisons avec vos données :</Text>
                    <View style={styles.listContainer}>
                        <View style={styles.listItem}><Text>🔒</Text><Text style={[styles.listText, { marginLeft: 8 }]}>Stockage chiffré et sécurisé</Text></View>
                        <View style={styles.listItem}><Text>👁</Text><Text style={[styles.listText, { marginLeft: 8 }]}>Seule l'équipe InzuHub peut y accéder</Text></View>
                        <View style={styles.listItem}><Text>🗑</Text><Text style={[styles.listText, { marginLeft: 8 }]}>Supprimés après vérification</Text></View>
                    </View>
                </ScrollView>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep('recto')}>
                        <Text style={styles.primaryBtnText}>Commencer la vérification →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (currentStep === 'recto' || currentStep === 'verso' || currentStep === 'selfie') {
        const isRecto = currentStep === 'recto';
        const isVerso = currentStep === 'verso';

        const title = isRecto ? "Recto de votre carte" : isVerso ? "Verso de votre carte" : "Selfie avec votre carte";
        const subtitle = isRecto ? "Prenez en photo le RECTO (côté avec votre photo)" : isVerso ? "Prenez en photo le VERSO (côté avec le code-barre)" : "Tenez votre carte à côté de votre visage";
        const hasPhoto = isRecto ? !!photoRecto : isVerso ? !!photoVerso : !!photoSelfie;
        const uri = isRecto ? photoRecto : isVerso ? photoVerso : photoSelfie;
        const setUri = isRecto ? setPhotoRecto : isVerso ? setPhotoVerso : setPhotoSelfie;
        const retake = isRecto ? retakeRecto : isVerso ? retakeVerso : retakeSelfie;

        return (
            <View style={styles.container}>
                {renderHeader(title)}
                <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
                    <KycStepIndicator currentStep={isRecto ? 1 : isVerso ? 2 : 3} completedSteps={getCompletedSteps()} />
                    <Text style={styles.stepSubtitle}>{subtitle}</Text>

                    <CaptureFrame
                        type={isRecto || isVerso ? 'card' : 'selfie'}
                        hasPhoto={hasPhoto}
                        photoUri={uri}
                        onCapture={(img) => setUri(img)}
                        onRetake={retake}
                    />

                    {!hasPhoto && (
                        <View style={styles.tipsContainer}>
                            <Text style={styles.tipText}>⚡ Bon éclairage (évitez les reflets)</Text>
                            {isRecto || isVerso ? (
                                <>
                                    <Text style={styles.tipText}>📐 Cadrez bien toute la carte</Text>
                                    <Text style={styles.tipText}>🔍 Assurez-vous que le texte est lisible</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.tipText}>😊 Regardez la caméra</Text>
                                    <Text style={styles.tipText}>🪪 Carte entière visible et lisible</Text>
                                </>
                            )}
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, !hasPhoto && { backgroundColor: COLORS.border }]}
                        disabled={!hasPhoto}
                        onPress={() => setStep(isRecto ? 'verso' : isVerso ? 'selfie' : 'review')}
                    >
                        <Text style={styles.primaryBtnText}>Suivant →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (currentStep === 'review') {
        return (
            <View style={styles.container}>
                {renderHeader("Vérifiez vos documents")}
                <ScrollView contentContainerStyle={styles.stepContent} showsVerticalScrollIndicator={false}>
                    <Text style={styles.stepSubtitle}>Assurez-vous que toutes les photos sont nettes et lisibles.</Text>

                    <View style={styles.reviewGrid}>
                        <ReviewBox title="RECTO" uri={photoRecto} onRetake={() => setStep('recto')} />
                        <ReviewBox title="VERSO" uri={photoVerso} onRetake={() => setStep('verso')} />
                        <ReviewBox title="SELFIE" uri={photoSelfie} onRetake={() => setStep('selfie')} />
                    </View>

                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => setLegalChecked(!legalChecked)}>
                        <MaterialIcons
                            name={legalChecked ? 'check-box' : 'check-box-outline-blank'}
                            size={24}
                            color={legalChecked ? COLORS.primary : COLORS.textSecondary}
                        />
                        <Text style={styles.checkboxLabel}>J'atteste que ces documents m'appartiennent et que les informations sont exactes.</Text>
                    </TouchableOpacity>

                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.primaryBtn, (!legalChecked || !canSubmit) && { backgroundColor: COLORS.border }]}
                        disabled={!legalChecked || !canSubmit || isSubmitting}
                        onPress={submitKyc}
                    >
                        {isSubmitting ? <ActivityIndicator size="small" color={COLORS.surface} /> : <Text style={styles.primaryBtnText}>Soumettre ma vérification</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (currentStep === 'submitted') {
        return (
            <View style={styles.container}>
                <View style={styles.submittedContent}>
                    <Text style={styles.heroEmoji}>✅</Text>
                    <Text style={[styles.introTitle, { marginTop: SPACING.md }]}>Dossier soumis avec succès !</Text>
                    <Text style={styles.introSubtitle}>Votre demande de vérification a été reçue par InzuHub.</Text>

                    <View style={styles.divider} />

                    <View style={styles.listContainer}>
                        <View style={styles.listItem}><Text>⏱</Text><Text style={[styles.listText, { marginLeft: 8 }]}>Délai de traitement : 24-48h</Text></View>
                        <View style={styles.listItem}><Text>📱</Text><Text style={[styles.listText, { marginLeft: 8, flex: 1 }]}>Vous recevrez une notification push dès que votre identité sera vérifiée.</Text></View>
                        <View style={styles.listItem}><Text>📧</Text><Text style={[styles.listText, { marginLeft: 8 }]}>En cas de problème, support@inzuhub.rw</Text></View>
                    </View>
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.outlineBtn} onPress={() => router.replace('/profile')}>
                        <Text style={styles.outlineBtnText}>Retour au profil</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return null;
}

const ReviewBox = ({ title, uri, onRetake }: { title: string, uri: string | null, onRetake: () => void }) => (
    <View style={styles.reviewBox}>
        <Text style={styles.reviewBoxTitle}>{title}</Text>
        <View style={styles.reviewImageContainer}>
            <Image source={{ uri: uri || 'https://via.placeholder.com/150' }} style={styles.reviewImage} />
            <TouchableOpacity style={styles.reviewOverlayBtn} onPress={onRetake}>
                <MaterialIcons name="refresh" size={16} color={COLORS.surface} />
                <Text style={styles.reviewOverlayText}>Revoir</Text>
            </TouchableOpacity>
        </View>
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
        paddingBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    introContent: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    stepContent: {
        padding: SPACING.md,
    },
    heroEmoji: {
        fontSize: 72,
        marginBottom: SPACING.md,
    },
    introTitle: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    introSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        alignSelf: 'flex-start',
        marginBottom: SPACING.sm,
    },
    listContainer: {
        alignSelf: 'flex-start',
        width: '100%',
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginLeft: 8,
    },
    footer: {
        padding: SPACING.lg,
        paddingBottom: 40,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    primaryBtnText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    outlineBtn: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    outlineBtnText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    stepSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
    },
    tipsContainer: {
        marginTop: SPACING.md,
    },
    tipText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
    },
    reviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: SPACING.sm,
    },
    reviewBox: {
        width: '48%',
        marginBottom: SPACING.md,
    },
    reviewBoxTitle: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    reviewImageContainer: {
        height: 120,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        position: 'relative',
    },
    reviewImage: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    reviewOverlayBtn: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 6,
        alignItems: 'center',
    },
    reviewOverlayText: {
        color: COLORS.surface,
        fontSize: 12,
        marginLeft: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        backgroundColor: `${COLORS.secondary}1A`,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.secondary,
        marginTop: SPACING.md,
    },
    checkboxLabel: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        lineHeight: 20,
    },
    submittedContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.xl,
    }
});
