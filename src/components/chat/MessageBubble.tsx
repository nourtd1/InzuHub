import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { MessageComplet } from '../../types/database.types';
import VisiteCard from './VisiteCard';
import Avatar from '../ui/Avatar';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface MessageBubbleProps {
    message: MessageComplet;
    isMe: boolean;
    isProprietaire: boolean;
    onConfirmVisite: (visiteId: string, date: string, heure: string) => void;
    onCancelVisite: (visiteId: string, date: string, heure: string) => void;
    showAvatar?: boolean;
}

export default function MessageBubble({
    message,
    isMe,
    isProprietaire,
    onConfirmVisite,
    onCancelVisite,
    showAvatar = true
}: MessageBubbleProps) {
    const { t } = useTranslation();
    const time = format(new Date(message.date_envoi), 'HH:mm');

    // Rendu spécifique pour les types Visite
    if (message.type === 'visite_confirmee' || message.type === 'visite_annulee') {
        const isConfirmed = message.type === 'visite_confirmee';
        return (
            <View style={styles.systemContainer}>
                <View style={[styles.systemBadge, { backgroundColor: isConfirmed ? `${COLORS.secondary}15` : `${COLORS.danger}15` }]}>
                    <MaterialIcons
                        name={isConfirmed ? 'check-circle' : 'cancel'}
                        size={16}
                        color={isConfirmed ? COLORS.secondary : COLORS.danger}
                    />
                    <Text style={[styles.systemText, { color: isConfirmed ? COLORS.secondary : COLORS.danger }]}>
                        {isConfirmed ? t('message.visit_confirmed_card') : t('message.visit_cancelled_card')}
                    </Text>
                </View>
                <Text style={styles.systemTime}>{time}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, isMe ? styles.myContainer : styles.otherContainer]}>
            {!isMe && showAvatar && (
                <View style={styles.avatarWrapper}>
                    <Avatar
                        uri={message.expediteur?.avatar_url}
                        name={message.expediteur?.nom_complet || '?'}
                        size={32}
                    />
                </View>
            )}

            <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.otherBubbleWrapper]}>
                <View style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.otherBubble,
                    message.type === 'visite_proposee' && styles.visiteProposedBubble
                ]}>

                    {message.type === 'visite_proposee' ? (
                        <VisiteCard
                            message={message}
                            isProprietaire={isProprietaire}
                            onConfirm={onConfirmVisite}
                            onCancel={onCancelVisite}
                        />
                    ) : (
                        <Text style={[styles.text, isMe ? styles.myText : styles.otherText]}>
                            {message.contenu}
                        </Text>
                    )}

                    <View style={styles.footer}>
                        <Text style={[styles.time, isMe ? styles.myTime : styles.otherTime]}>
                            {time}
                        </Text>
                        {isMe && (
                            <MaterialIcons
                                name={message.lu ? "done-all" : "done"}
                                size={14}
                                color={message.lu ? COLORS.secondary : COLORS.surface}
                                style={styles.statusIcon}
                            />
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: SPACING.md,
        maxWidth: '85%',
    },
    myContainer: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    otherContainer: {
        alignSelf: 'flex-start',
    },
    avatarWrapper: {
        marginRight: 8,
        alignSelf: 'flex-end',
        marginBottom: 2,
    },
    bubbleWrapper: {
        flex: 1,
    },
    myBubbleWrapper: {
        alignItems: 'flex-end',
    },
    otherBubbleWrapper: {
        alignItems: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: BORDER_RADIUS.lg,
        minWidth: 60,
    },
    myBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 2,
    },
    otherBubble: {
        backgroundColor: COLORS.surface,
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    visiteProposedBubble: {
        padding: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        minWidth: 260,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        lineHeight: 20,
    },
    myText: {
        color: COLORS.surface,
    },
    otherText: {
        color: COLORS.textPrimary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
    },
    time: {
        fontSize: 10,
    },
    myTime: {
        color: `${COLORS.surface}CC`,
    },
    otherTime: {
        color: COLORS.textSecondary,
    },
    statusIcon: {
        marginLeft: 4,
    },
    systemContainer: {
        alignSelf: 'center',
        marginVertical: SPACING.md,
        alignItems: 'center',
    },
    systemBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.full,
        marginBottom: 4,
    },
    systemText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    systemTime: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
});
