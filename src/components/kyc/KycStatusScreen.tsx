import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { KycDemande } from '../../types/database.types';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router } from 'expo-router';

interface KycStatusScreenProps {
    demande: KycDemande;
    onResubmit: () => void;
}

export default function KycStatusScreen({ demande, onResubmit }: KycStatusScreenProps) {
    const { statut, motif_rejet, date_soumission } = demande;

    if (statut === 'en_attente') {
        return (
            <View style={styles.container}>
                <View style={[styles.card, styles.cardWarning]}>
                    <Text style={styles.emoji}>⏳</Text>
                    <Text style={[styles.title, { color: COLORS.warning }]}>Demande en attente</Text>
                    <Text style={styles.text}>Votre dossier a été soumis le {format(new Date(date_soumission), 'dd MMMM yyyy', { locale: fr })}.</Text>
                    <Text style={[styles.text, { marginTop: SPACING.sm, fontWeight: 'bold' }]}>Délai habituel : 24 à 48 heures.</Text>
                    <Text style={styles.text}>Vous serez notifié par push.</Text>

                    <TouchableOpacity style={styles.supportBtn} onPress={() => Linking.openURL('mailto:support@inzuhub.rw')}>
                        <MaterialIcons name="headset-mic" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                        <Text style={styles.supportBtnText}>Contacter le support</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.returnBtn} onPress={() => router.replace('/profile')}>
                    <Text style={styles.returnBtnText}>Retour au profil</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (statut === 'en_cours_review') {
        return (
            <View style={styles.container}>
                <View style={[styles.card, styles.cardPrimary]}>
                    <Text style={styles.emoji}>🔍</Text>
                    <Text style={[styles.title, { color: COLORS.primary }]}>En cours de vérification</Text>
                    <Text style={styles.text}>Notre équipe examine votre dossier.</Text>
                    <Text style={[styles.text, { marginTop: SPACING.sm }]}>Merci de votre patience.</Text>
                </View>
                <TouchableOpacity style={styles.returnBtn} onPress={() => router.replace('/profile')}>
                    <Text style={styles.returnBtnText}>Retour au profil</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (statut === 'approuve') {
        return (
            <View style={styles.container}>
                <View style={[styles.card, styles.cardSuccess]}>
                    <Text style={styles.emoji}>✅</Text>
                    <Text style={[styles.title, { color: COLORS.secondary }]}>Identité vérifiée !</Text>
                    <Text style={styles.text}>Votre compte est maintenant certifié par InzuHub.</Text>
                    <Text style={[styles.text, { marginTop: SPACING.sm }]}>Votre badge de vérification est visible sur toutes vos annonces et profile.</Text>
                </View>
                <TouchableOpacity style={styles.returnBtn} onPress={() => router.replace('/profile')}>
                    <Text style={styles.returnBtnText}>Super ! Retour</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (statut === 'rejete') {
        return (
            <View style={styles.container}>
                <View style={[styles.card, styles.cardDanger]}>
                    <Text style={styles.emoji}>❌</Text>
                    <Text style={[styles.title, { color: COLORS.danger }]}>Vérification refusée</Text>
                    <Text style={[styles.text, { fontWeight: 'bold', marginVertical: SPACING.sm }]}>Motif : {motif_rejet || 'Non spécifié'}</Text>
                    <Text style={styles.text}>Vous pouvez soumettre un nouveau dossier en prenant soin de corriger le problème indiqué.</Text>

                    <TouchableOpacity style={styles.resubmitBtn} onPress={onResubmit}>
                        <Text style={styles.resubmitBtnText}>→ Resoumettre mon dossier</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
        backgroundColor: COLORS.background,
    },
    card: {
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        alignItems: 'center',
    },
    cardWarning: {
        backgroundColor: `${COLORS.warning}1A`,
        borderColor: COLORS.warning,
    },
    cardPrimary: {
        backgroundColor: `${COLORS.primary}1A`,
        borderColor: COLORS.primary,
    },
    cardSuccess: {
        backgroundColor: `${COLORS.secondary}1A`,
        borderColor: COLORS.secondary,
    },
    cardDanger: {
        backgroundColor: `${COLORS.danger}1A`,
        borderColor: COLORS.danger,
    },
    emoji: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        textAlign: 'center',
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        textAlign: 'center',
        lineHeight: 22,
    },
    supportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xl,
        padding: SPACING.sm,
    },
    supportBtnText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
    },
    resubmitBtn: {
        backgroundColor: COLORS.danger,
        paddingVertical: 14,
        paddingHorizontal: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        marginTop: SPACING.xl,
        width: '100%',
        alignItems: 'center',
    },
    resubmitBtnText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    returnBtn: {
        paddingVertical: 14,
        marginTop: SPACING.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
    },
    returnBtnText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    }
});
