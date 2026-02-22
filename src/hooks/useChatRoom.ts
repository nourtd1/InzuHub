import { useState, useCallback, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from './useAuth';
import { Message } from '../types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useChatRoom(conversationId: string) {
    const { user } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [details, setDetails] = useState<any>(null); // Conversation details (interlocuteur, property)
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const loadConversation = useCallback(async () => {
        if (!user || !conversationId) return;

        try {
            // Load messages and details in parallel
            const [fetchedMessages, fetchedDetails] = await Promise.all([
                messageService.fetchMessages(conversationId),
                messageService.fetchConversationDetails(conversationId)
            ]);

            setMessages(fetchedMessages);
            setDetails(fetchedDetails);

            // Mark as read immediately on load
            await messageService.markMessagesAsRead(conversationId, user.id);
        } catch (error) {
            console.error("Failed to load chat room:", error);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, user]);

    useEffect(() => {
        let channel: RealtimeChannel;

        if (conversationId && user) {
            loadConversation();

            channel = messageService.subscribeToMessages(conversationId, (payload) => {
                // If it's a new insert
                if (payload.eventType === 'INSERT') {
                    const newMessage = payload.new as Message;
                    // Prepend to list (inverted flatlist)
                    setMessages(prev => [newMessage, ...prev]);

                    // If we receive a message from the other person while in room, mark it as read
                    if (newMessage.id_expediteur !== user.id) {
                        messageService.markMessagesAsRead(conversationId, user.id);
                    }
                } else if (payload.eventType === 'UPDATE') {
                    // Could be marking as read
                    setMessages(prev => prev.map(m => m.id_message === payload.new.id_message ? payload.new as Message : m));
                }
            });
        }

        return () => {
            if (channel) {
                // To unsubscribe
                channel.unsubscribe();
            }
        };
    }, [conversationId, user, loadConversation]);

    const sendMessage = async (contenu: string) => {
        if (!user || !contenu.trim()) return;

        setIsSending(true);
        try {
            await messageService.sendMessage(conversationId, user.id, contenu.trim());
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const proposeVisit = async (dateStr: string) => {
        if (!user) return;
        try {
            await messageService.proposeVisit(conversationId, user.id, dateStr);
        } catch (error) {
            console.error("Failed to propose visit:", error);
        }
    };

    const respondToVisit = async (visiteId: string, accept: boolean) => {
        if (!user) return;
        try {
            await messageService.respondToVisit(visiteId, conversationId, user.id, accept);
        } catch (error) {
            console.error("Failed to respond to visit:", error);
        }
    };

    // Derived info
    const interlocuteur = details
        ? (details.id_locataire === user?.id ? details.proprietaire : details.locataire)
        : null;

    const property = details?.propriete || null;

    return {
        messages,
        details,
        interlocuteur,
        property,
        isLoading,
        isSending,
        sendMessage,
        proposeVisit,
        respondToVisit
    };
}
