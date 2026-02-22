import { supabase } from '../lib/supabase';
import { Message, Utilisateur, Visite } from '../types/database.types';
import { RealtimeChannel } from '@supabase/supabase-js';

export type MessageAvecExpediteur = Message & {
    expediteur?: Pick<Utilisateur, 'id_utilisateur' | 'nom_complet' | 'avatar_url'>;
    // Local fields for offline/optimistic UI
    isOptimistic?: boolean;
    hasError?: boolean;
};

export const messageService = {
    /**
     * Fetch all messages for a specific conversation with pagination
     */
    async fetchMessages(
        conversationId: string,
        page: number = 0,
        pageSize: number = 30
    ): Promise<MessageAvecExpediteur[]> {
        const offset = page * pageSize;
        const limit = pageSize - 1;

        // Note: we need to select the relations as well
        const { data, error } = await (supabase.from('messages') as any)
            .select(`
                *,
                expediteur:utilisateurs!messages_id_expediteur_fkey(id_utilisateur, nom_complet, avatar_url)
            `)
            .eq('id_conversation', conversationId)
            .order('date_envoi', { ascending: false })
            .range(offset, offset + limit);

        if (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }

        return (data || []).map((msg: any) => ({
            ...msg,
            expediteur: Array.isArray(msg.expediteur) ? msg.expediteur[0] : msg.expediteur
        }));
    },

    /**
     * Send a standard text message
     */
    async sendMessage(
        conversationId: string,
        expediteurId: string,
        contenu: string,
        type: 'texte' | 'visite_proposee' | 'visite_confirmee' = 'texte'
    ): Promise<MessageAvecExpediteur> {
        const { data, error } = await (supabase.from('messages') as any)
            .insert({
                id_conversation: conversationId,
                id_expediteur: expediteurId,
                contenu,
                type,
            })
            .select(`
                *,
                expediteur:utilisateurs!messages_id_expediteur_fkey(id_utilisateur, nom_complet, avatar_url)
            `)
            .single();

        if (error) {
            console.error('Error sending message:', error);
            throw error;
        }

        // Update the conversation's derniere_activite
        await (supabase.from('conversations') as any)
            .update({ derniere_activite: new Date().toISOString() })
            .eq('id_conversation', conversationId);

        return {
            ...data,
            expediteur: Array.isArray(data.expediteur) ? data.expediteur[0] : data.expediteur
        };
    },

    /**
     * Mark all unread messages received by the user in this conversation as read
     */
    async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
        const { error } = await (supabase.from('messages') as any)
            .update({ lu: true })
            .eq('id_conversation', conversationId)
            .neq('id_expediteur', userId)
            .eq('lu', false);

        if (error) {
            console.error('Error marking messages as read:', error);
        }
    },

    /* Subscribe to new messages */
    subscribeToMessages(
        conversationId: string,
        onNewMessage: (message: MessageAvecExpediteur) => void
    ): RealtimeChannel {
        return supabase
            .channel(`chat-${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `id_conversation=eq.${conversationId}`
            }, async (payload) => {
                const newMsg = payload.new as Message;
                // Fetch the expediteur info for the new message
                const { data } = await (supabase.from('utilisateurs') as any)
                    .select('id_utilisateur, nom_complet, avatar_url')
                    .eq('id_utilisateur', newMsg.id_expediteur)
                    .single();

                onNewMessage({
                    ...newMsg,
                    expediteur: data
                });
            })
            .subscribe();
    },

    /** Subscribe to updates (like message read) */
    subscribeToMessageUpdates(
        conversationId: string,
        onUpdate: (message: MessageAvecExpediteur) => void
    ): RealtimeChannel {
        return supabase
            .channel(`chat-updates-${conversationId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'messages',
                filter: `id_conversation=eq.${conversationId}`
            }, (payload) => {
                onUpdate(payload.new as MessageAvecExpediteur);
            })
            .subscribe();
    },

    /** Presence tracking for typing indicators */
    subscribeToTypingPresence(
        conversationId: string,
        currentUserId: string,
        onTyping: (userId: string, isTyping: boolean) => void
    ) {
        const channel = supabase.channel(`typing-${conversationId}`, {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        });

        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            // state is { [userId]: [{ is_typing: boolean }] }
            for (const id in state) {
                if (id !== currentUserId && state[id].length > 0) {
                    const presenceInfo: any = state[id][0];
                    if (presenceInfo.is_typing) {
                        onTyping(id, true);
                    }
                }
            }
        });

        channel.subscribe();
        return channel;
    },

    unsubscribe(channel: RealtimeChannel): void {
        supabase.removeChannel(channel);
    },

    // Optional legacy functions from prompt 
    async fetchConversationDetails(conversationId: string) {
        const { data, error } = await (supabase.from('conversations') as any)
            .select(`
                *,
                propriete:proprietes(id_propriete, id_utilisateur, titre, prix_mensuel, quartier:quartiers(nom_quartier)),
                locataire:utilisateurs!conversations_id_locataire_fkey(id_utilisateur, nom_complet, avatar_url, numero_telephone, statut_verification),
                proprietaire:utilisateurs!conversations_id_proprietaire_fkey(id_utilisateur, nom_complet, avatar_url, numero_telephone, statut_verification)
            `)
            .eq('id_conversation', conversationId)
            .single();

        if (error) {
            console.error('Error fetching conversation details:', error);
            throw error;
        }
        return data;
    }
};
