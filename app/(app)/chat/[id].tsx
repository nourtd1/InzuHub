import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Linking
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../src/hooks/useAuth';
import { useChat } from '../../../src/hooks/useChat';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { useTranslation } from 'react-i18next';
import { isSameDay } from 'date-fns';

import Avatar from '../../../src/components/ui/Avatar';
import MessageBubble from '../../../src/components/chat/MessageBubble';
import ChatInputBar from '../../../src/components/chat/ChatInputBar';
import TypingIndicator from '../../../src/components/chat/TypingIndicator';
import DateSeparator from '../../../src/components/chat/DateSeparator';
import VisiteWidget from '../../../src/components/visite/VisiteWidget';
import ChatHeaderMenu from '../../../src/components/chat/ChatHeaderMenu';
import { useConversations } from '../../../src/hooks/useConversations';

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { deleteConversation } = useConversations();

    const {
        messages,
        isLoading,
        isSending,
        hasMore,
        isTyping,
        sendMessage,
        sendVisiteProposition,
        confirmerVisite,
        annulerVisite,
        loadMore,
        broadcastTyping
    } = useChat(id as string);

    const [isVisiteWidgetVisible, setIsVisiteWidgetVisible] = useState(false);

    // Trouver la conversation actuelle pour les détails du header
    const { conversations } = useConversations();
    const conversation = useMemo(() =>
        conversations.find(c => c.id_conversation === id),
        [conversations, id]);

    const isLocataire = conversation?.locataire.id_utilisateur === user?.id;
    const interlocuteur = isLocataire ? conversation?.proprietaire : conversation?.locataire;
    const property = conversation?.propriete;

    // Préparer les données pour la liste inversée
    const listData = useMemo(() => {
        const data: any[] = [];
        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const nextMsg = messages[i + 1];

            data.push({ type: 'message', data: msg });

            if (!nextMsg || !isSameDay(new Date(msg.date_envoi), new Date(nextMsg.date_envoi))) {
                data.push({ type: 'date', date: msg.date_envoi });
            }
        }
        return data;
    }, [messages]);

    const handleCall = () => {
        if (interlocuteur?.numero_telephone) {
            Linking.openURL(`tel:${interlocuteur.numero_telephone}`);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            t('chat.delete_title'),
            t('chat.delete_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        await deleteConversation(id as string);
                        router.back();
                    }
                }
            ]
        );
    };

    if (isLoading && messages.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={0}
        >
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerInfo}
                    activeOpacity={0.7}
                    onPress={() => property && router.push(`/property/${property.id_propriete}`)}
                >
                    <Avatar
                        uri={interlocuteur?.avatar_url}
                        name={interlocuteur?.nom_complet || '?'}
                        size={40}
                        isVerified={interlocuteur?.statut_verification}
                    />
                    <View style={styles.headerText}>
                        <Text style={styles.headerName} numberOfLines={1}>{interlocuteur?.nom_complet}</Text>
                        <Text style={styles.headerProperty} numberOfLines={1}>🏠 {property?.titre}</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleCall} style={styles.headerActionCircle}>
                        <MaterialIcons name="call" size={20} color={COLORS.primary} />
                    </TouchableOpacity>

                    <ChatHeaderMenu
                        propertyId={property?.id_propriete || ''}
                        onReport={() => Alert.alert('Signalement', 'Fonctionnalité à venir')}
                        onDelete={handleDelete}
                    />
                </View>
            </View>

            {/* Message List */}
            <FlatList
                data={listData}
                keyExtractor={(item, index) => item.type === 'date' ? `date-${item.date}` : item.data.id_message}
                inverted
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                    if (item.type === 'date') return <DateSeparator date={item.date} />;
                    return (
                        <MessageBubble
                            message={item.data}
                            isMe={item.data.id_expediteur === user?.id}
                            isProprietaire={!isLocataire}
                            onConfirmVisite={confirmerVisite}
                            onCancelVisite={annulerVisite}
                        />
                    );
                }}
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListHeaderComponent={
                    isTyping ? (
                        <TypingIndicator
                            isTyping={true}
                            userName={interlocuteur?.nom_complet}
                            userAvatar={interlocuteur?.avatar_url}
                        />
                    ) : null
                }
            />

            {/* Input Bar */}
            <ChatInputBar
                onSend={sendMessage}
                onTyping={broadcastTyping}
                onScheduleVisit={() => setIsVisiteWidgetVisible(true)}
                isSending={isSending}
                canSchedule={isLocataire}
            />

            {/* Visite Widget Modal */}
            {property && (
                <VisiteWidget
                    visible={isVisiteWidgetVisible}
                    onClose={() => setIsVisiteWidgetVisible(false)}
                    conversationId={id as string}
                    proprietaireId={conversation?.id_proprietaire || ''}
                    propertyTitle={property.titre}
                    propertyQuartier={property.quartier?.nom_quartier || ''}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 50,
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 3,
    },
    backButton: {
        padding: 4,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING.md,
    },
    headerText: {
        marginLeft: SPACING.sm,
        flex: 1,
    },
    headerName: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    headerProperty: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerActionCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${COLORS.primary}10`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.xs,
    },
    listContent: {
        paddingVertical: SPACING.md,
        paddingBottom: SPACING.xl,
    },
});
