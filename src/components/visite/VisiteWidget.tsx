import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getProchains30Jours, genererCreneaux, formatHeure } from '../../utils/formatters';
import { useVisitePlanner } from '../../hooks/useVisitePlanner';
import DayCard from './DayCard';
import TimeSlot from './TimeSlot';
import StepIndicator from './StepIndicator';

interface VisiteWidgetProps {
    visible: boolean;
    onClose: () => void;
    conversationId: string;
    proprietaireId: string;
    propertyTitle: string;
    propertyQuartier: string;
}

export default function VisiteWidget({ visible, onClose, conversationId, proprietaireId, propertyTitle, propertyQuartier }: VisiteWidgetProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);

    const {
        selectedDate,
        selectedHeure,
        isSubmitting,
        setSelectedDate,
        setSelectedHeure,
        submitVisite,
        reset,
        creneauxDisponibles
    } = useVisitePlanner(conversationId, proprietaireId);

    const jours = getProchains30Jours();
    const tousCreneaux = genererCreneaux();

    const handleClose = () => {
        reset();
        setStep(1);
        onClose();
    };

    const handleSumbit = async () => {
        await submitVisite();
        handleClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <View style={styles.overlay}>
                <View style={styles.sheet}>

                    {/* Header */}
                    <View style={styles.header}>
                        {step > 1 ? (
                            <TouchableOpacity onPress={() => setStep(s => (s - 1) as any)} style={styles.backBtn}>
                                <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        ) : (
                            <View style={{ width: 40 }} />
                        )}
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.title}>
                                {step === 1 ? '📅 Proposer une visite' : step === 2 ? "⏰ Choisissez l'heure" : '✅ Confirmer'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <StepIndicator currentStep={step} labels={['Date', 'Heure', 'Confirmation']} />

                    {/* Content */}
                    <View style={styles.content}>
                        {step === 1 && (
                            <View>
                                <Text style={styles.subtitle}>Choisissez une date pour visiter ce logement</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                                    {jours.map((jour, i) => (
                                        <DayCard
                                            key={i}
                                            date={jour}
                                            isSelected={selectedDate?.getTime() === jour.getTime()}
                                            isToday={false} // starts tomorrow
                                            isSunday={jour.getDay() === 0}
                                            onPress={() => setSelectedDate(jour)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {step === 2 && (
                            <View>
                                {selectedDate && (
                                    <Text style={styles.subtitle}>
                                        {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </Text>
                                )}
                                <View style={styles.grid}>
                                    {tousCreneaux.map(heure => (
                                        <View key={heure} style={{ width: '33.33%' }}>
                                            <TimeSlot
                                                heure={heure}
                                                isSelected={selectedHeure === heure}
                                                isAvailable={creneauxDisponibles.includes(heure)}
                                                onPress={() => setSelectedHeure(heure)}
                                            />
                                        </View>
                                    ))}
                                </View>
                                <Text style={styles.legend}>🟢 Disponible   🔵 Sélectionné   🔒 Indisponible</Text>
                            </View>
                        )}

                        {step === 3 && (
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>📅 Visite proposée</Text>

                                <Text style={styles.summaryItem}>🏠 {propertyTitle}</Text>
                                <Text style={styles.summaryItem}>📍 {propertyQuartier}, Gisenyi</Text>

                                <View style={styles.divider} />

                                {selectedDate && selectedHeure && (
                                    <>
                                        <Text style={styles.summaryItem}>📆 {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                                        <Text style={styles.summaryItem}>⏰ {formatHeure(selectedHeure)}</Text>
                                        <Text style={styles.summaryItem}>⏱ Durée estimée : ~1 heure</Text>
                                    </>
                                )}

                                <View style={styles.divider} />

                                <Text style={styles.summaryInfo}>
                                    ℹ️ Cette proposition sera envoyée au propriétaire qui devra confirmer ou refuser dans le chat.
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Footer Actions */}
                    <View style={styles.footer}>
                        {step === 1 && (
                            <TouchableOpacity
                                style={[styles.mainBtn, !selectedDate && styles.mainBtnDisabled]}
                                disabled={!selectedDate}
                                onPress={() => setStep(2)}
                            >
                                <Text style={styles.mainBtnText}>Suivant →</Text>
                            </TouchableOpacity>
                        )}
                        {step === 2 && (
                            <TouchableOpacity
                                style={[styles.mainBtn, !selectedHeure && styles.mainBtnDisabled]}
                                disabled={!selectedHeure}
                                onPress={() => setStep(3)}
                            >
                                <Text style={styles.mainBtnText}>Suivant →</Text>
                            </TouchableOpacity>
                        )}
                        {step === 3 && (
                            <TouchableOpacity
                                style={styles.mainBtn}
                                onPress={handleSumbit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color={COLORS.surface} />
                                ) : (
                                    <Text style={styles.mainBtnText}>Envoyer la proposition</Text>
                                )}
                            </TouchableOpacity>
                        )}
                        {step === 3 && (
                            <Text style={styles.footerDisclaimer}>
                                Vous recevrez une notification quand le propriétaire répondra.
                            </Text>
                        )}
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        paddingBottom: 34,
        minHeight: '60%',
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    backBtn: {
        width: 40,
        alignItems: 'center',
        padding: SPACING.xs,
        marginLeft: -8,
    },
    closeBtn: {
        width: 40,
        alignItems: 'center',
        padding: SPACING.xs,
        marginRight: -8,
    },
    content: {
        padding: SPACING.md,
        flexGrow: 1,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    daysScroll: {
        paddingRight: SPACING.md,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -4,
    },
    legend: {
        marginTop: SPACING.lg,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    summaryCard: {
        backgroundColor: `${COLORS.primary}0D`,
        borderColor: `${COLORS.primary}33`,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
    },
    summaryTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    summaryItem: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },
    summaryInfo: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
    },
    footer: {
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    mainBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    mainBtnDisabled: {
        opacity: 0.5,
    },
    mainBtnText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    footerDisclaimer: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
    }
});
