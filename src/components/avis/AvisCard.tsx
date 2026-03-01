import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { AvisComplet } from '../../types/database.types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import Avatar from '../ui/Avatar';
import StarRating from '../ui/StarRating';
import { formatDateRelative } from '../../utils/formatters';

interface AvisCardProps {
    avis: AvisComplet;
    currentUserId?: string;
    onDelete?: () => void;
}

export default function AvisCard({ avis, currentUserId, onDelete }: AvisCardProps) {
    const { t } = useTranslation();
    const isAuthor = currentUserId === avis.id_auteur;

    const handleDelete = () => {
        Alert.alert(
            t('reviews.delete_confirm'),
            '',
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.yes'), style: 'destructive', onPress: onDelete }
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Avatar uri={avis.auteur.avatar_url} name={avis.auteur.nom_complet || 'User'} size={40} />
                <View style={styles.headerText}>
                    <Text style={styles.authorName}>{avis.auteur.nom_complet}</Text>
                    <View style={styles.starsRow}>
                        <StarRating value={avis.note} size={14} />
                        <Text style={styles.dateText}> {formatDateRelative(avis.date_avis)}</Text>
                    </View>
                </View>

                {isAuthor && onDelete && (
                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </TouchableOpacity>
                )}
            </View>

            {avis.commentaire && (
                <Text style={styles.comment}>{avis.commentaire}</Text>
            )}

            <View style={styles.propertyRow}>
                <Ionicons name="home-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.propertyTitle} numberOfLines={1}>{avis.propriete.titre}</Text>
            </View>
        </View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    headerText: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    authorName: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    dateText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    deleteButton: {
        padding: SPACING.xs,
    },
    comment: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        lineHeight: 22,
        marginBottom: SPACING.sm,
    },
    propertyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
        paddingTop: SPACING.xs,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    propertyTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginLeft: SPACING.xs,
        flex: 1,
    }
});
