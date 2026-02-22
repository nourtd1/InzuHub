import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { MessageAvecExpediteur } from '../../services/messageService';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Visite } from '../../types/database.types';
import { formatDateVisite } from '../../utils/formatters';

interface MessageBubbleProps {
    message: MessageAvecExpediteur;
    isMe: boolean;
    onConfirmVisite?: () => void;
    onRefuserVisite?: () => void;
}

export default function MessageBubble({ message, isMe, onConfirmVisite, onRefuserVisite }: MessageBubbleProps) {

    const renderTimeString = (dateStr: string) => {
        try {
            return format(new Date(dateStr), 'HH:mm');
        } catch (e) {
            return '';
        }
    };

    // Render Indicators
    const renderIndicator = () => {
        if (!isMe) return null; // No indicators on received messages

        if (message.hasError) {
            return <MaterialIcons name="error-outline" size={14} color={COLORS.danger} style={styles.indicator} />;
        }
        if (message.isOptimistic) {
            return <ActivityIndicatorOrHourglass />;
        }

        // Delivered / Read
        if (message.lu) {
            return <MaterialIcons name="done-all" size={14} color={COLORS.surface} style={styles.indicator} />;
        }
        // Just delivered (gray, or light white since background is primary)
        return <MaterialIcons name="done" size={14} color="rgba(255,255,255,0.6)" style={styles.indicator} />;
    };

    /** VARIANTES B & C : VISITES */
    if (message.type === 'visite_proposee' || message.type === 'visite_confirmee') {
        let payload: any = {};
        try {
            payload = JSON.parse(message.contenu || '{}');
        } catch (e) {
            console.error(e);
        }

        const isProposee = message.type === 'visite_proposee';
        const dateObj = payload.date_visite || payload.date; // handle variation
        const formattedDate = dateObj ? formatDateVisite(dateObj) : '';
        const rawDate = dateObj ? new Date(dateObj) : new Date();
        const shortDate = format(rawDate, "d MMMM yyyy", { locale: fr });
        const timeStr = format(rawDate, "HH:mm");

        const systemText = isProposee
            ? `📅 ${isMe ? 'Vous avez' : "L'utilisateur a"} proposé une visite le ${shortDate} à ${timeStr}`
            : `✅ Visite confirmée pour le ${shortDate} à ${timeStr} !`;

        return (
            <View>
                {/* SYSTEM MESSAGE ABOVE */}
                <Text style={styles.systemMessageText}>{systemText}</Text>

                <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
                    <View style={[
                        styles.visitBubble,
                        isProposee ? styles.visitBubbleProposee : styles.visitBubbleConfirmee
                    ]}>
                        <View style={styles.visitHeader}>
                            {isProposee ? (
                                <MaterialIcons name="event" size={20} color={COLORS.warning} />
                            ) : (
                                <MaterialIcons name="event-available" size={20} color={COLORS.secondary} />
                            )}
                            <Text style={[styles.visitTitle, isProposee ? { color: COLORS.warning } : { color: COLORS.secondary }]}>
                                {isProposee ? '📅 Visite proposée' : '✅ Visite confirmée !'}
                            </Text>
                        </View>

                        <View style={styles.visitDivider} />

                        {formattedDate ? (
                            <View style={styles.visitDateRows}>
                                <Text style={styles.visitDateLabel}>
                                    {formattedDate}
                                </Text>
                            </View>
                        ) : null}

                        {/* Actions if proposee and not me */}
                        {isProposee && !isMe && (
                            <View style={styles.visitActions}>
                                <TouchableOpacity style={styles.visitBtnReject} onPress={onRefuserVisite}>
                                    <Text style={styles.visitTextReject}>✗ Refuser</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.visitBtnAccept} onPress={onConfirmVisite}>
                                    <Text style={styles.visitTextAccept}>✓ Confirmer</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Pending state if proposee and me */}
                        {isProposee && isMe && (
                            <Text style={styles.visitPendingText}>
                                En attente de confirmation...
                            </Text>
                        )}

                        {/* Adding to calendar if confirmed */}
                        {!isProposee && (
                            <TouchableOpacity style={styles.visitBtnCalendar} onPress={() => {
                                const calendarUrl = Platform.select({
                                    ios: `calshow:${new Date(rawDate).getTime() / 1000}`,
                                    android: `content://com.android.calendar/events`
                                });
                                Linking.openURL(calendarUrl || '');
                            }}>
                                <Text style={styles.visitTextCalendar}>📅 Ajouter au calendrier</Text>
                            </TouchableOpacity>
                        )}

                    </View>
                </View>
            </View>
        );
    }

    /** DETECTION ANNULATION SYSTEME */
    if (message.type === 'texte' && message.contenu?.startsWith('❌ La visite')) {
        return (
            <View style={styles.container}>
                <Text style={styles.systemMessageText}>{message.contenu}</Text>
            </View>
        );
    }

    /** VARIANTE A : MESSAGE ORDINAIRE */
    return (
        <View style={[styles.container, isMe ? styles.alignRight : styles.alignLeft]}>
            <View style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
                message.isOptimistic && styles.optimisticBubble,
                message.hasError && styles.errorBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    isMe ? styles.myMessageText : styles.theirMessageText
                ]}>
                    {message.contenu}
                </Text>

                <View style={styles.footerRow}>
                    <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
                        {renderTimeString(message.date_envoi)}
                    </Text>
                    {renderIndicator()}
                </View>

                {message.hasError && (
                    <Text style={styles.errorSubText}>Erreur d'envoi. Touchez pour réessayer.</Text>
                )}
            </View>
        </View>
    );
}

// Custom simple Hourglass component replacing native ActivityIndicator for better sizing
const ActivityIndicatorOrHourglass = () => (
    <MaterialIcons name="hourglass-bottom" size={12} color="rgba(255,255,255,0.6)" style={styles.indicator} />
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 4,
        paddingHorizontal: SPACING.md,
    },
    alignRight: {
        alignItems: 'flex-end',
    },
    alignLeft: {
        alignItems: 'flex-start',
    },
    systemMessageText: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        paddingVertical: SPACING.xs,
        marginVertical: SPACING.sm,
    },
    bubble: {
        maxWidth: '78%',
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    myBubble: {
        backgroundColor: COLORS.primary,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        borderBottomLeftRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.sm,
    },
    theirBubble: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.lg,
        borderBottomLeftRadius: BORDER_RADIUS.sm,
    },
    optimisticBubble: {
        opacity: 0.6,
    },
    errorBubble: {
        backgroundColor: `${COLORS.danger}15`,
        borderColor: COLORS.danger,
        borderWidth: 1,
    },
    messageText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        lineHeight: 22,
    },
    myMessageText: {
        color: COLORS.surface,
    },
    theirMessageText: {
        color: COLORS.textPrimary,
    },
    errorSubText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.danger,
        marginTop: 4,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
    },
    timeText: {
        fontSize: 11,
    },
    myTimeText: {
        color: 'rgba(255,255,255,0.7)',
    },
    theirTimeText: {
        color: COLORS.textSecondary,
    },
    indicator: {
        marginLeft: 4,
    },

    /** VISITE STYLES */
    visitBubble: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        width: 260,
    },
    visitBubbleProposee: {
        backgroundColor: `${COLORS.warning}1A`, // 10%
        borderColor: COLORS.warning,
    },
    visitBubbleConfirmee: {
        backgroundColor: `${COLORS.secondary}1A`, // 10%
        borderColor: COLORS.secondary,
    },
    visitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    visitTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        marginLeft: SPACING.xs,
    },
    visitDivider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        marginVertical: SPACING.sm,
    },
    visitDateRows: {
        marginVertical: SPACING.xs,
    },
    visitDateLabel: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    visitTimeLabel: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        fontWeight: '600',
        marginTop: 2,
    },
    visitActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
    },
    visitBtnReject: {
        flex: 1,
        marginRight: SPACING.xs,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: 'transparent',
    },
    visitBtnAccept: {
        flex: 1,
        marginLeft: SPACING.xs,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface, // Or transparent depending on desired emphasis
        borderWidth: 1,
        borderColor: COLORS.warning,
        alignItems: 'center',
    },
    visitTextReject: {
        textAlign: 'center',
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    visitTextAccept: {
        textAlign: 'center',
        color: COLORS.warning,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    visitPendingText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: SPACING.md,
        textAlign: 'center',
    },
    visitBtnCalendar: {
        marginTop: SPACING.md,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.secondary,
        alignItems: 'center',
    },
    visitTextCalendar: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    }
});
