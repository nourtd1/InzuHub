import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { formatDateVisite } from '../../utils/formatters';
import type { MessageComplet } from '../../types/database.types';

interface VisiteCardProps {
    message: MessageComplet;
    isProprietaire: boolean;
    onConfirm: (visiteId: string, date: string, heure: string) => void;
    onCancel: (visiteId: string, date: string, heure: string) => void;
}

export default function VisiteCard({ message, isProprietaire, onConfirm, onCancel }: VisiteCardProps) {
    const { t } = useTranslation();

    if (message.type !== 'visite_proposee' || !message.metadata) return null;

    const { id_visite = '', date_visite = '' } = message.metadata || {};
    const [date, heure] = date_visite.split('T');
    const displayDate = formatDateVisite(date_visite);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialIcons name="event" size={20} color={COLORS.primary} />
                <Text style={styles.headerTitle}>{t('message.propose_visit')}</Text>
            </View>

            <View style={styles.details}>
                <Text style={styles.dateText}>{displayDate}</Text>
            </View>

            {isProprietaire ? (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => onCancel(id_visite, date, heure.slice(0, 5))}
                    >
                        <Text style={styles.cancelButtonText}>{t('common.refuse')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={() => onConfirm(id_visite, date, heure.slice(0, 5))}
                    >
                        <Text style={styles.confirmButtonText}>{t('common.confirm')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.waitBadge}>
                    <MaterialIcons name="access-time" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.waitText}>{t('visit_card.pending_confirmation')}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginVertical: SPACING.xs,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginLeft: SPACING.xs,
    },
    details: {
        marginBottom: SPACING.md,
    },
    dateText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    button: {
        flex: 0.48,
        height: 36,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    confirmButtonText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeXS,
        fontWeight: 'bold',
    },
    cancelButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.danger,
    },
    cancelButtonText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.fontSizeXS,
        fontWeight: 'bold',
    },
    waitBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: BORDER_RADIUS.sm,
        alignSelf: 'flex-start',
    },
    waitText: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginLeft: 4,
        fontStyle: 'italic',
    },
});
