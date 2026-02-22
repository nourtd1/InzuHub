import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ConversationListItem } from '../../services/conversationService';
import Avatar from '../ui/Avatar';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { formatConversationTime } from '../../utils/formatters';

interface ConversationItemProps {
    conversation: ConversationListItem;
    currentUserId: string;
    onPress: () => void;
}

export default function ConversationItem({ conversation, currentUserId, onPress }: ConversationItemProps) {
    const isOwner = currentUserId === conversation.id_proprietaire;
    const { dernier_message, unread_count, interlocuteur, propriete } = conversation;

    // Determine the last message content
    const getLastMessageText = () => {
        if (!dernier_message) return "Démarrez la conversation...";

        let prefix = dernier_message.id_expediteur === currentUserId ? "Vous : " : "";
        let content = dernier_message.contenu;

        if (dernier_message.type === 'visite_proposee') {
            return `${prefix}📅 Visite proposée`;
        }
        if (dernier_message.type === 'visite_confirmee') {
            return `${prefix}✅ Visite confirmée`;
        }

        return `${prefix}${content}`;
    };

    const isUnread = unread_count > 0;
    const timeText = dernier_message
        ? formatConversationTime(dernier_message.date_envoi)
        : formatConversationTime(conversation.date_creation);

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            style={[styles.container, isUnread && styles.unreadContainer]}
        >
            <View style={styles.avatarContainer}>
                <Avatar
                    uri={interlocuteur.avatar_url}
                    name={interlocuteur.nom_complet || 'Utilisateur'}
                    size={52}
                />
                <View style={[styles.roleBadge, { backgroundColor: isOwner ? COLORS.secondary : COLORS.primary }]} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text
                        style={[styles.nameText, isUnread && styles.nameTextUnread]}
                        numberOfLines={1}
                    >
                        {interlocuteur.nom_complet}
                    </Text>
                    <Text style={[styles.timeText, isUnread && styles.timeTextUnread]}>
                        {timeText}
                    </Text>
                </View>

                <Text style={styles.propertyText} numberOfLines={1}>
                    🏠 {propriete?.titre}
                </Text>

                <View style={styles.footerRow}>
                    <Text
                        style={[
                            styles.messageText,
                            isUnread && styles.messageTextUnread,
                            !dernier_message && styles.messageTextEmpty
                        ]}
                        numberOfLines={1}
                    >
                        {getLastMessageText()}
                    </Text>

                    {isUnread && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCountText}>
                                {unread_count > 99 ? '99+' : unread_count}
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
    },
    unreadContainer: {
        backgroundColor: `${COLORS.primary}0D`, // 5% opacity
    },
    avatarContainer: {
        position: 'relative',
        marginRight: SPACING.md,
    },
    roleBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    nameText: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginRight: SPACING.sm,
    },
    nameTextUnread: {
        fontWeight: '800',
    },
    timeText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    timeTextUnread: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    propertyText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    messageText: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    messageTextUnread: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    messageTextEmpty: {
        fontStyle: 'italic',
    },
    unreadBadge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    unreadCountText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeXS,
        fontWeight: 'bold',
    },
});
