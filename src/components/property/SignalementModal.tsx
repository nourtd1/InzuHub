import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

interface SignalementModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (motif: string) => Promise<void>;
}

const MOTIFS_PREDEFINIS = [
    "Fausse annonce / photos incorrectes",
    "Prix réel différent du prix affiché",
    "Propriétaire demande de l'argent avant la visite",
    "Logement déjà loué mais annonce toujours active",
    "Coordonnées incorrectes ou inexistantes",
    "Autre"
];

export default function SignalementModal({ isVisible, onClose, onSubmit }: SignalementModalProps) {
    const { user } = useAuth();
    const [selectedMotif, setSelectedMotif] = useState<string>('');
    const [autrePrecisions, setAutrePrecisions] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSend = async () => {
        if (!selectedMotif) return;

        let finalMotif = selectedMotif;
        if (selectedMotif === 'Autre') {
            if (!autrePrecisions.trim()) {
                Alert.alert('Erreur', 'Veuillez préciser le motif de votre signalement.');
                return;
            }
            finalMotif = autrePrecisions.trim();
        }

        setIsLoading(true);
        try {
            await onSubmit(finalMotif);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setSelectedMotif('');
                setAutrePrecisions('');
                onClose();
            }, 2000);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible d\'envoyer le signalement. Réessayez plus tard.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                {/* Touche pour fermer en dehors */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.modalContent}>
                    <View style={styles.handle} />

                    {isSuccess ? (
                        <View style={styles.successContainer}>
                            <MaterialIcons name="check-circle" size={48} color={COLORS.secondary} />
                            <Text style={styles.successText}>Signalement envoyé</Text>
                            <Text style={styles.successSubtext}>
                                Notre équipe va examiner cette annonce dans les plus brefs délais.
                            </Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.title}>Signaler cette annonce</Text>
                            <Text style={styles.subtitle}>
                                Aidez-nous à maintenir la qualité des annonces sur InzuHub
                            </Text>

                            <View style={styles.motifsContainer}>
                                {MOTIFS_PREDEFINIS.map((motif, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.radioRow}
                                        onPress={() => setSelectedMotif(motif)}
                                    >
                                        <View style={[styles.radioOutline, selectedMotif === motif && styles.radioActive]}>
                                            {selectedMotif === motif && <View style={styles.radioInner} />}
                                        </View>
                                        <Text style={styles.radioLabel}>{motif}</Text>
                                    </TouchableOpacity>
                                ))}

                                {selectedMotif === 'Autre' && (
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Veuillez préciser le problème..."
                                        placeholderTextColor={COLORS.textSecondary}
                                        multiline
                                        numberOfLines={3}
                                        value={autrePrecisions}
                                        onChangeText={setAutrePrecisions}
                                    />
                                )}
                            </View>

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.cancelText}>Annuler</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.submitButton, !selectedMotif && styles.buttonDisabled]}
                                    onPress={handleSend}
                                    disabled={!selectedMotif || isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.surface} />
                                    ) : (
                                        <Text style={styles.submitText}>Envoyer le signalement</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        paddingBottom: 40, // Safe area
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.danger,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.lg,
    },
    motifsContainer: {
        marginBottom: SPACING.xl,
    },
    radioRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    radioOutline: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    radioActive: {
        borderColor: COLORS.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
    },
    radioLabel: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        flex: 1,
    },
    textInput: {
        backgroundColor: '#F8F9FF',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.background,
    },
    cancelText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    submitButton: {
        backgroundColor: COLORS.danger,
    },
    submitText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    successText: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: SPACING.md,
    },
    successSubtext: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.sm,
        paddingHorizontal: SPACING.lg,
    },
});
