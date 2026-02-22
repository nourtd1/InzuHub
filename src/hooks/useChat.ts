import { useState, useCallback, useEffect, useRef } from 'react';
import { messageService, MessageAvecExpediteur } from '../services/messageService';
import { visiteService } from '../services/visiteService';
import { useAuth } from './useAuth';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ConversationAvecDetails, Visite } from '../types/database.types';
import { Alert } from 'react-native';

export function useChat(conversationId: string) {
    const { user } = useAuth();

    // States
    const [messages, setMessages] = useState<MessageAvecExpediteur[]>([]);
    const [conversation, setConversation] = useState<ConversationAvecDetails | null>(null);
    const [visiteActive, setVisiteActive] = useState<Visite | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [inputText, setInputText] = useState('');
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [isTyping, setIsTyping] = useState(false); // is interlocutor typing?
    const [typingUserId, setTypingUserId] = useState<string | null>(null);

    // Pagination
    const pageRef = useRef(0);
    const pageSize = 30;

    // Presence Channel
    const presenceChannelRef = useRef<RealtimeChannel | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const loadInitialData = useCallback(async () => {
        if (!user || !conversationId) return;

        try {
            const [fetchedMessages, fetchedDetails, fetchedVisiteActive] = await Promise.all([
                messageService.fetchMessages(conversationId, 0, pageSize),
                messageService.fetchConversationDetails(conversationId),
                visiteService.getVisiteActive(conversationId)
            ]);

            setMessages(fetchedMessages);
            setConversation(fetchedDetails);
            setVisiteActive(fetchedVisiteActive);

            if (fetchedMessages.length < pageSize) {
                setCanLoadMore(false);
            }

            await messageService.markMessagesAsRead(conversationId, user.id);
        } catch (error) {
            console.error("Failed to load chat room:", error);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, user]);

    useEffect(() => {
        let insertChannel: RealtimeChannel;
        let updateChannel: RealtimeChannel;

        if (conversationId && user) {
            loadInitialData();

            // 1. Insert messages subscription
            insertChannel = messageService.subscribeToMessages(conversationId, (newMsg) => {
                // If it's another user's message, append it and mark as read
                if (newMsg.id_expediteur !== user.id) {
                    setMessages(prev => {
                        // Check if it already exists implicitly
                        if (prev.find(m => m.id_message === newMsg.id_message)) return prev;
                        return [newMsg, ...prev];
                    });
                    messageService.markMessagesAsRead(conversationId, user.id);
                } else {
                    // For my messages, they are handled by optimistic UI, but if a different device sent it:
                    setMessages(prev => {
                        const exists = prev.find(m => m.id_message === newMsg.id_message);
                        if (!exists && !prev.find(m => m.contenu === newMsg.contenu && m.isOptimistic)) {
                            return [newMsg, ...prev];
                        }
                        return prev;
                    });
                }
            });

            // 2. Update messages subscription
            updateChannel = messageService.subscribeToMessageUpdates(conversationId, (updatedMsg) => {
                setMessages(prev => prev.map(m => m.id_message === updatedMsg.id_message ? { ...m, ...updatedMsg } : m));
            });

            // 3. Presence subscription (Typing Indicator)
            presenceChannelRef.current = messageService.subscribeToTypingPresence(
                conversationId,
                user.id,
                (id, typing) => {
                    setIsTyping(typing);
                    setTypingUserId(id);
                }
            );
        }

        return () => {
            if (insertChannel) messageService.unsubscribe(insertChannel);
            if (updateChannel) messageService.unsubscribe(updateChannel);
            if (presenceChannelRef.current) messageService.unsubscribe(presenceChannelRef.current);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            // Mark as read when leaving
            if (conversationId && user) {
                messageService.markMessagesAsRead(conversationId, user.id);
            }
        };
    }, [conversationId, user, loadInitialData]);

    const loadMoreMessages = async () => {
        if (!canLoadMore || isLoadingMore || !user) return;

        setIsLoadingMore(true);
        try {
            const nextPage = pageRef.current + 1;
            const olderMessages = await messageService.fetchMessages(conversationId, nextPage, pageSize);

            if (olderMessages.length > 0) {
                // Append logic for inverted flatlist
                setMessages(prev => [...prev, ...olderMessages]);
                pageRef.current = nextPage;
            }

            if (olderMessages.length < pageSize) {
                setCanLoadMore(false);
            }
        } catch (error) {
            console.error("Failed to load more messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const emitTypingEvent = () => {
        if (!presenceChannelRef.current || !user) return;

        presenceChannelRef.current.track({ is_typing: true });

        // Debounce to stop typing
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            presenceChannelRef.current?.track({ is_typing: false });
        }, 1500);
    };

    const handleSetInputText = (text: string) => {
        setInputText(text);
        emitTypingEvent();
    };

    const sendMessage = async (type: 'texte' | 'visite_proposee' | 'visite_confirmee' = 'texte', contentOverride?: string) => {
        const contentToSend = contentOverride || inputText.trim();
        if (!user || !contentToSend) return;

        setIsSending(true);
        if (type === 'texte') setInputText(''); // clear input immediately

        const tempId = `optimistic-${Date.now()}`;
        const optimisticMessage: MessageAvecExpediteur = {
            id_message: tempId,
            id_conversation: conversationId,
            id_expediteur: user.id,
            contenu: contentToSend,
            type,
            date_envoi: new Date().toISOString(),
            lu: false,
            isOptimistic: true,
        };

        // Add to UI immediately
        setMessages(prev => [optimisticMessage, ...prev]);

        try {
            // Send real message
            const realMessage = await messageService.sendMessage(conversationId, user.id, contentToSend, type);
            // Replace optimistic with real
            setMessages(prev => prev.map(m => m.id_message === tempId ? realMessage : m));
        } catch (error) {
            console.error("Failed to send message:", error);
            // Show error state on message
            setMessages(prev => prev.map(m => m.id_message === tempId ? { ...m, hasError: true, isOptimistic: false } : m));
            Alert.alert("Erreur", "Le message n'a pas pu être envoyé.");
        } finally {
            setIsSending(false);
            if (presenceChannelRef.current) presenceChannelRef.current.track({ is_typing: false });
        }
    };

    const updateVisiteStatus = async (visiteId: string, status: 'confirmee' | 'annulee') => {
        try {
            if (status === 'confirmee') {
                await visiteService.confirmerVisite(visiteId);
            } else if (status === 'annulee') {
                await visiteService.annulerVisite(visiteId);
            }
            const active = await visiteService.getVisiteActive(conversationId);
            setVisiteActive(active);
        } catch (error) {
            console.error(error);
        }
    };

    return {
        messages,
        conversation,
        isLoading,
        isLoadingMore,
        isSending,
        inputText,
        setInputText: handleSetInputText,
        sendMessage,
        loadMoreMessages,
        canLoadMore,
        isTyping,
        visiteActive,
        updateVisiteStatus,
        refreshVisiteActive: async () => {
            const active = await visiteService.getVisiteActive(conversationId);
            setVisiteActive(active);
        }
    };
}
