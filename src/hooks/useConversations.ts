import { useState, useCallback, useEffect } from 'react';
import { conversationService, ConversationListItem } from '../services/conversationService';
import { useAuth } from './useAuth';
import { useUnread } from '../store/UnreadContext';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UseConversationsReturn {
    conversations: ConversationListItem[];
    isLoading: boolean;
    isRefreshing: boolean;
    totalUnread: number;
    refresh: () => Promise<void>;
    markAsRead: (conversationId: string) => Promise<void>;
    deleteConversation: (conversationId: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
    const { user } = useAuth();
    const { totalUnread, refreshUnread } = useUnread();

    const [conversations, setConversations] = useState<ConversationListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchConversations = useCallback(async (background = false) => {
        if (!user) return;
        if (!background) setIsLoading(true);
        else setIsRefreshing(true);

        try {
            const data = await conversationService.fetchMyConversations(user.id);
            // Re-sort in JS just to be absolutely sure, using the dernier_message date if valid, else date_creation
            const sortedData = data.sort((a, b) => {
                const dateA = a.dernier_message?.date_envoi || a.date_creation;
                const dateB = b.dernier_message?.date_envoi || b.date_creation;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
            setConversations(sortedData);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        let channel: RealtimeChannel;

        if (user) {
            fetchConversations();

            // Subscribe to updates for the list itself
            channel = conversationService.subscribeToConversations(user.id, () => {
                fetchConversations(true);
                refreshUnread();
            });
        }

        return () => {
            if (channel) {
                conversationService.unsubscribeFromConversations(channel);
            }
        };
    }, [user, fetchConversations, refreshUnread]);

    const refresh = async () => {
        await fetchConversations(true);
        await refreshUnread();
    };

    const markAsRead = async (conversationId: string) => {
        if (!user) return;
        try {
            await conversationService.markConversationAsRead(conversationId, user.id);
            // Optimistic update
            setConversations(prev => prev.map(conv => {
                if (conv.id_conversation === conversationId) {
                    return { ...conv, unread_count: 0, dernier_message: { ...conv.dernier_message!, lu: true } };
                }
                return conv;
            }));
            refreshUnread();
        } catch (error) {
            console.error('Failed to mark conversation as read:', error);
        }
    };

    const deleteConversation = async (conversationId: string) => {
        try {
            await conversationService.deleteConversation(conversationId);
            setConversations(prev => prev.filter(c => c.id_conversation !== conversationId));
            refreshUnread();
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            throw error;
        }
    };

    return {
        conversations,
        isLoading,
        isRefreshing,
        totalUnread,
        refresh,
        markAsRead,
        deleteConversation,
    };
}
