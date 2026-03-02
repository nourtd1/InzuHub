import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    Linking,
    Animated
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '../../../src/hooks/useAuth';
import { useChat } from '../../../src/hooks/useChat';
import { COLORS } from '../../../src/constants/theme';
import { useTranslation } from 'react-i18next';
import { isSameDay } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';

import Avatar from '../../../src/components/ui/Avatar';
import MessageBubble from '../../../src/components/chat/MessageBubble';
import ChatInputBar from '../../../src/components/chat/ChatInputBar';
import TypingIndicator from '../../../src/components/chat/TypingIndicator';
import DateSeparator from '../../../src/components/chat/DateSeparator';
import VisiteWidget from '../../../src/components/visite/VisiteWidget';
import { useConversations } from '../../../src/hooks/useConversations';

function OfflineBanner() {
    const { t } = useTranslation();
    const [isOffline, setIsOffline] = useState(false);
    const slideAnim = useRef(new Animated.Value(-60)).current;

    useEffect(() => {
        const unsubscribe = addEventListener(state => {
            const offline = !state.isConnected;
            setIsOffline(offline);
            Animated.timing(slideAnim, {
                toValue: offline ? 0 : -60,
                duration: 300,
                useNativeDriver: true,
            }).start();
        });
        return unsubscribe;
    }, []);

    if (!isOffline) return null;

    return (
        <Animated.View style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: COLORS.warning + '20',
            borderBottomWidth: 1,
            borderBottomColor: COLORS.warning + '40',
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
        }}>
            <Text style={{ fontSize: 16 }}>⚠️</Text>
            <Text style={{
                flex: 1,
                fontSize: 13,
                color: COLORS.warning,
                fontWeight: '500',
            }}>
                {t('chat.offline_error')}
            </Text>
        </Animated.View>
    );
}

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useTranslation();
    const { deleteConversation } = useConversations();
    const insets = useSafeAreaInsets();
    const headerHeight = useHeaderHeight();
    const flatListRef = useRef<FlatList>(null);

    const {
        messages,
        isLoading,
        isSending,
        isTyping,
        sendMessage,
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

    // Scroll vers le bas à l'ouverture (0 = bas en inversé)
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                    offset: 0,
                    animated: false,
                });
            }, 100);
        }
    }, []);

    // Scroll automatique nouveau message
    useEffect(() => {
        if (messages[0]?.id_expediteur === user?.id) {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }
    }, [messages[0]?.id_message]);

    const openActionSheet = () => {
        Alert.alert(
            t('chat.options'),
            undefined,
            [
                { text: t('chat.report'), onPress: () => Alert.alert('Signalement', 'Fonctionnalité à venir') },
                { text: t('common.delete'), style: 'destructive', onPress: handleDelete },
                { text: t('common.cancel'), style: 'cancel' }
            ]
        );
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

    const keyboardOffset = Platform.select({
        ios: headerHeight,
        android: 0,
        default: 0,
    });

    if (isLoading && messages.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (!interlocuteur || !property) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: () => (
                        <TouchableOpacity
                            onPress={() => router.push(`/property/${property.id_propriete}`)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                        >
                            <Avatar
                                uri={interlocuteur.avatar_url}
                                name={interlocuteur.nom_complet}
                                size={36}
                                isVerified={interlocuteur.statut_verification}
                            />
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text style={{
                                        fontSize: 15,
                                        fontWeight: '600',
                                        color: COLORS.textPrimary,
                                        maxWidth: 160,
                                    }}
                                        numberOfLines={1}
                                    >
                                        {interlocuteur.nom_complet}
                                    </Text>
                                    {interlocuteur.statut_verification === true && (
                                        <Text style={{ color: COLORS.secondary, fontSize: 13 }}>✓</Text>
                                    )}
                                </View>
                                <Text style={{
                                    fontSize: 12,
                                    color: COLORS.textSecondary,
                                    maxWidth: 160,
                                }}
                                    numberOfLines={1}
                                >
                                    {property.titre}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', gap: 4, marginRight: 8 }}>
                            <TouchableOpacity
                                onPress={() => Linking.openURL(`tel:${interlocuteur.numero_telephone}`)}
                                style={{
                                    width: 36, height: 36, borderRadius: 18,
                                    backgroundColor: COLORS.secondary + '15',
                                    justifyContent: 'center', alignItems: 'center',
                                }}
                            >
                                <MaterialIcons name="call" size={18} color={COLORS.secondary} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={openActionSheet}
                                style={{
                                    width: 36, height: 36, borderRadius: 18,
                                    backgroundColor: COLORS.border,
                                    justifyContent: 'center', alignItems: 'center',
                                }}
                            >
                                <Text style={{
                                    fontSize: 20, color: COLORS.textPrimary,
                                    letterSpacing: -2, fontWeight: 'bold'
                                }}>⋮</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                    headerShadowVisible: true,
                    headerBackVisible: true,
                    headerBackTitle: '',
                    headerTintColor: COLORS.primary,
                }}
            />

            <OfflineBanner />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={keyboardOffset}
            >
                <FlatList
                    ref={flatListRef}
                    data={listData}
                    inverted
                    keyExtractor={(item, index) => item.type === 'date' ? `date-${item.date}` : item.data.id_message}
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
                    contentContainerStyle={{
                        paddingTop: 16,
                        paddingBottom: 8,
                        paddingHorizontal: 16,
                        flexGrow: 1,
                    }}
                    style={{ flex: 1 }}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                    automaticallyAdjustContentInsets={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                        autoscrollToTopThreshold: 100,
                    }}
                />

                {isTyping && (
                    <TypingIndicator
                        isTyping={true}
                        userName={interlocuteur.nom_complet}
                        userAvatar={interlocuteur.avatar_url}
                    />
                )}

                <ChatInputBar
                    onSend={sendMessage}
                    onOpenVisitePlanner={() => setIsVisiteWidgetVisible(true)}
                    isSending={isSending}
                    onTyping={broadcastTyping}
                    bottomInset={insets.bottom}
                    canSchedule={isLocataire}
                />
            </KeyboardAvoidingView>

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
        </View>
    );
}

// Minimal MaterialIcons shim if not available, but user has it in package.json
import { MaterialIcons } from '@expo/vector-icons';

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background
    },
});
