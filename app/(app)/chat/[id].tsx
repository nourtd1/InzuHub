import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

import { useAuth } from '../../../src/hooks/useAuth';
import { useChat } from '../../../src/hooks/useChat';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { formatPrixMensuel } from '../../../src/utils/formatters';

import Avatar from '../../../src/components/ui/Avatar';
import MessageBubble from '../../../src/components/chat/MessageBubble';
import ChatInputBar from '../../../src/components/chat/ChatInputBar';
import TypingIndicator from '../../../src/components/chat/TypingIndicator';
import ChatHeaderMenu from '../../../src/components/chat/ChatHeaderMenu';
import DateSeparator from '../../../src/components/chat/DateSeparator';
import VisiteWidget from '../../../src/components/visite/VisiteWidget';
import { MessageAvecExpediteur } from '../../../src/services/messageService';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const { width } = Dimensions.get('window');

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const [isVisiteWidgetVisible, setIsVisiteWidgetVisible] = useState(false);

    const {
        messages,
        conversation,
        isLoading,
        isLoadingMore,
        isSending,
        inputText,
        setInputText,
        sendMessage,
        loadMoreMessages,
        isTyping,
        visiteActive,
        updateVisiteStatus,
        refreshVisiteActive
    } = useChat(id as string);

    // Derived flags & logic
    const isLocataire = conversation?.id_locataire === user?.id;
    const interlocuteur = isLocataire ? conversation?.proprietaire : conversation?.locataire;
    const property = conversation?.propriete;

    // Process messages natively for FlatList to include DateSeparators 
    // Since Native FlatList inverted = true expects [MostRecent, Older, Oldest]
    // The previous message (older in time) would logically be element i+1 in array.
    const messageData = useMemo(() => {
        let result: any[] = [];

        for (let i = 0; i < messages.length; i++) {
            const currentMsg = messages[i];
            const previousMsg = messages[i + 1]; // "previous" chronological message

            result.push({ type: 'msg', data: currentMsg });

            // If there's no previous chronologically, or the day differs, push a DateSeparator
            if (!previousMsg) {
                result.push({ type: 'date', date: currentMsg.date_envoi, id: `date-${currentMsg.id_message}` });
            } else if (!isSameDay(new Date(currentMsg.date_envoi), new Date(previousMsg.date_envoi))) {
                result.push({ type: 'date', date: currentMsg.date_envoi, id: `date-${currentMsg.id_message}` });
            }
        }
        return result;
    }, [messages]);

    const handleReport = () => {
        // Router push or open signalement modal
        Alert.alert("Signalement", "L'annonce va être signalée.");
    };

    const handleDelete = () => {
        Alert.alert(
            "Supprimer la conversation",
            "Cette action est irréversible.",
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => router.push('/(app)/(tabs)/chat') }
            ]
        );
    };

    const Header = () => (
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>

                {interlocuteur && (
                    <View style={styles.headerUserInfo}>
                        <Avatar
                            uri={interlocuteur.avatar_url}
                            name={interlocuteur.nom_complet || 'Utilisateur'}
                            size={36}
                        />
                        <View style={styles.headerNameContainer}>
                            <Text style={styles.headerNameText} numberOfLines={1}>
                                {interlocuteur.nom_complet}
                            </Text>
                            {property && (
                                <Text style={styles.headerPropertyContext} numberOfLines={1}>
                                    🏠 {property.titre}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {property && (
                    <ChatHeaderMenu
                        propertyId={property.id_propriete}
                        onReport={handleReport}
                        onDelete={handleDelete}
                    />
                )}
            </View>

            {/* Context Property Banner */}
            {property && (
                <View style={styles.propertyBanner}>
                    <View style={styles.placeholderThumbnail} />
                    <View style={styles.bannerInfo}>
                        <Text style={styles.propertyBannerTitle} numberOfLines={1}>
                            {property.titre}
                        </Text>
                        <Text style={styles.propertyBannerPrice}>
                            {formatPrixMensuel(property.prix_mensuel)} • {property.quartier?.nom_quartier}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push(`/property/${property.id_propriete}`)}>
                        <Text style={styles.bannerActionText}>Voir →</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const WelcomeMessage = () => (
        <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>🏠 InzuHub</Text>
            <Text style={styles.welcomeSubtitle}>Conversation démarrée pour :</Text>
            <Text style={styles.welcomePropertyTitle}>"{property?.titre}"</Text>

            <View style={styles.welcomeDivider} />

            <Text style={styles.welcomeInstructions}>
                Posez vos questions directement au propriétaire — sans commissionnaire !
            </Text>
        </View>
    );

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        if (item.type === 'date') {
            return <DateSeparator dateString={item.date} />;
        }

        const messageData = item.data as MessageAvecExpediteur;
        const isMe = messageData.id_expediteur === user?.id;

        return (
            <MessageBubble
                message={messageData}
                isMe={isMe}
                onConfirmVisite={() => {
                    const payload = JSON.parse(messageData.contenu || '{}');
                    const visitId = payload.id_visite || payload.visiteId; // Handle both cases for robustness
                    updateVisiteStatus(visitId, 'confirmee');
                }}
                onRefuserVisite={() => {
                    const payload = JSON.parse(messageData.contenu || '{}');
                    const visitId = payload.id_visite || payload.visiteId;
                    updateVisiteStatus(visitId, 'annulee');

                    const d = new Date(payload.date_visite || payload.date);
                    const dateStr = format(d, 'd MMM yyyy', { locale: fr });
                    sendMessage('texte', `❌ La visite du ${dateStr} a été annulée.`);
                }}
            />
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <Header />

            <FlatList
                data={messageData}
                keyExtractor={(item, index) => item.type === 'date' ? item.id : item.data.id_message}
                inverted
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.listContent}
                renderItem={renderItem}
                onEndReached={loadMoreMessages}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => isLoadingMore ? <ActivityIndicator size="small" color={COLORS.primary} style={{ margin: SPACING.md }} /> : null}
                ListHeaderComponent={() => isTyping ? <TypingIndicator /> : null}
                ListEmptyComponent={WelcomeMessage}
            />

            <ChatInputBar
                value={inputText}
                onChangeText={setInputText}
                onSend={() => sendMessage('texte')}
                isSending={isSending}
                canProposeVisite={true} // Tenants and owners can trigger it
                visiteStatus={visiteActive?.statut}
                onPressVisite={() => setIsVisiteWidgetVisible(true)}
            />

            {property && (
                <VisiteWidget
                    visible={isVisiteWidgetVisible}
                    onClose={() => {
                        setIsVisiteWidgetVisible(false);
                        refreshVisiteActive();
                    }}
                    conversationId={id as string}
                    proprietaireId={property?.id_utilisateur || conversation?.id_proprietaire || ''}
                    propertyTitle={property?.titre || ''}
                    propertyQuartier={property?.quartier?.nom_quartier || 'Gisenyi'}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    headerContainer: {
        backgroundColor: COLORS.surface,
        paddingTop: 50, // rough safe area
        zIndex: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    backButton: {
        marginRight: SPACING.md,
        padding: SPACING.xs,
        marginLeft: -SPACING.xs,
    },
    headerUserInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerNameContainer: {
        marginLeft: SPACING.md,
        flex: 1,
        justifyContent: 'center',
    },
    headerNameText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    headerPropertyContext: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    propertyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}15`,
        borderColor: `${COLORS.primary}33`,
        borderWidth: 1,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
    },
    placeholderThumbnail: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.surface,
    },
    bannerInfo: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    propertyBannerTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    propertyBannerPrice: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    bannerActionText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.primary,
        padding: SPACING.xs,
    },
    listContent: {
        paddingVertical: SPACING.md,
    },

    // Welcome State
    welcomeContainer: {
        backgroundColor: `${COLORS.primary}0D`,
        borderColor: `${COLORS.primary}33`,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        margin: SPACING.lg,
        alignItems: 'center',
        transform: [{ scaleY: -1 }] // Due to inverted flatlist it renders upside down otherwise
    },
    welcomeTitle: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    welcomeSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    welcomePropertyTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '600',
        color: COLORS.primary,
        marginTop: SPACING.xs,
        textAlign: 'center',
    },
    welcomeDivider: {
        width: 40,
        height: 2,
        backgroundColor: COLORS.border,
        marginVertical: SPACING.md,
    },
    welcomeInstructions: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontStyle: 'italic',
    }
});
