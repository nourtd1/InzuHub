import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { formatConversationTime } from '../../utils/formatters';
import Avatar from '../ui/Avatar';
import type { ConversationComplete } from '../../types/database.types';
import { useTranslation } from 'react-i18next';

interface ConversationItemProps {
    conversation: ConversationComplete;
    currentUserId: string;
    onPress: () => void;
}

export default function ConversationItem({ conversation, currentUserId, onPress }: ConversationItemProps) {
    const { t } = useTranslation();
    const {
        locataire,
        proprietaire,
        propriete,
        dernier_message,
        non_lus,
        derniere_activite
    } = conversation;

    // Déterminer l'autre participant
    const isLocataire = locataire.id_utilisateur === currentUserId;
    const interlocuteur = isLocataire ? proprietaire : locataire;

    const isUnread = non_lus > 0;
    const time = formatConversationTime(dernier_message?.date_envoi || derniere_activite);

    // Formater l'aperçu du message
    const getMessagePreview = () => {
        if (!dernier_message) return t('chat.new_conversation', { titre: propriete.titre });

        const isMe = dernier_message.id_expediteur === currentUserId;
        const prefix = isMe ? `${t('chat.you')} : ` : '';

        switch (dernier_message.type) {
            case 'visite_proposee':
                return `📅 ${t('message.propose_visit')}`;
            case 'visite_confirmee':
                return `✅ ${t('message.visit_confirmed_card')}`;
            case 'visite_annulee':
                return `❌ ${t('message.visit_cancelled_card')}`;
            default:
                return `${prefix}${dernier_message.contenu}`;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, isUnread && styles.unreadContainer]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Avatar
                uri={interlocuteur.avatar_url}
                name={interlocuteur.nom_complet}
                size={52}
                isVerified={interlocuteur.statut_verification}
            />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text
                        style={[styles.name, isUnread && styles.unreadText]}
                        numberOfLines={1}
                    >
                        {interlocuteur.nom_complet}
                    </Text>
                    <Text style={[styles.time, isUnread && styles.unreadTime]}>
                        {time}
                    </Text>
                </View>

                <Text style={styles.propertyTitle} numberOfLines={1}>
                    🏠 {propriete.titre}
                </Text>

                <View style={styles.footer}>
                    <Text
                        style={[styles.lastMessage, isUnread && styles.unreadText]}
                        numberOfLines={1}
                    >
                        {getMessagePreview()}
                    </Text>

                    {isUnread && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>
                                {non_lus > 9 ? '9+' : non_lus}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
    },
    unreadContainer: {
        backgroundColor: `${COLORS.primary}08`, // 3% primary
    },
    content: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    name: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '600',
        color: COLORS.textPrimary,
        flex: 1,
        marginRight: SPACING.sm,
    },
    time: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    unreadTime: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    propertyTitle: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginBottom: 4,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        flex: 1,
        marginRight: SPACING.sm,
    },
    unreadText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    badge: {
        backgroundColor: COLORS.danger,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: COLORS.surface,
        fontSize: 10,
        fontWeight: 'bold',
    },
});
