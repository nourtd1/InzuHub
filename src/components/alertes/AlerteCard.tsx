import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { AlerteAvecQuartier } from '../../types/database.types';
import { Switch } from 'react-native-gesture-handler';
import { formatPrixRelativeDate } from '../../utils/formatters'; // Re-using existing, or customize if date format is strictly required

interface AlerteCardProps {
    alerte: AlerteAvecQuartier;
    onToggle: (active: boolean) => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function AlerteCard({ alerte, onToggle, onEdit, onDelete }: AlerteCardProps) {
    const renderCriteria = () => {
        const criteria = [];
        if (alerte.quartier) {
            criteria.push(`📍 ${alerte.quartier.nom_quartier}`);
        } else {
            criteria.push(`📍 Tous les quartiers`);
        }

        if (alerte.prix_min && alerte.prix_max) {
            criteria.push(`💰 ${alerte.prix_min} → ${alerte.prix_max} RWF`);
        } else if (alerte.prix_max) {
            criteria.push(`💰 Max ${alerte.prix_max} RWF`);
        }

        if (alerte.nombre_chambres) {
            criteria.push(`🛏 ${alerte.nombre_chambres} chambres min.`);
        }

        if (alerte.has_eau) criteria.push('💧');
        if (alerte.has_electricite) criteria.push('⚡');

        return criteria.join('  ');
    };

    return (
        <TouchableOpacity style={styles.card} onPress={onEdit} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Ionicons
                        name={alerte.est_active ? "notifications" : "notifications-off"}
                        size={20}
                        color={alerte.est_active ? COLORS.primary : COLORS.textTertiary}
                    />
                    <Text style={[styles.title, !alerte.est_active && styles.textInactive]} numberOfLines={1}>
                        {alerte.nom_alerte}
                    </Text>
                </View>
                <Switch
                    value={alerte.est_active}
                    onValueChange={onToggle}
                    trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
                    thumbColor={alerte.est_active ? COLORS.primary : COLORS.border}
                />
            </View>

            <View style={styles.criteriaContainer}>
                <Text style={styles.criteriaText}>{renderCriteria()}</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.dateText}>
                    {alerte.derniere_notif ? `Dernière notif : ${formatPrixRelativeDate(alerte.derniere_notif)}` : 'Pas encore de notification'}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: SPACING.sm,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginLeft: SPACING.xs,
        flex: 1,
    },
    textInactive: {
        color: COLORS.textTertiary,
    },
    criteriaContainer: {
        marginBottom: SPACING.sm,
        paddingLeft: 24, // Align with text
    },
    criteriaText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 24,
    },
    dateText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    }
});
