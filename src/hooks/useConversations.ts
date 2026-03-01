import { useState, useCallback, useEffect } from 'react'
import { conversationService } from '../services/conversationService'
import { useAuth } from './useAuth'
import { useUnread } from '../store/UnreadContext'
import type { ConversationComplete } from '../types/database.types'
import { supabase } from '../lib/supabase'

interface UseConversationsReturn {
    conversations: ConversationComplete[]
    isLoading: boolean
    isRefreshing: boolean
    error: string | null
    totalUnread: number
    refresh: () => void
    deleteConversation: (id: string) => Promise<void>
}

/**
 * Hook pour gérer la liste des conversations de l'utilisateur.
 */
export function useConversations(): UseConversationsReturn {
    const { user } = useAuth()
    const { totalUnread, refreshUnread } = useUnread()

    const [conversations, setConversations] = useState<ConversationComplete[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchConversations = useCallback(async (isSilent = false) => {
        if (!user) return

        if (!isSilent) setIsLoading(true)
        else setIsRefreshing(true)

        try {
            const data = await conversationService.fetchConversations(user.id)
            setConversations(data)
            setError(null)
        } catch (err: any) {
            console.error('[useConversations] fetch error:', err)
            setError(err.message || 'Erreur lors du chargement des conversations')
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }, [user])

    // Chargement initial et temps réel
    useEffect(() => {
        if (!user) return

        fetchConversations()

        // S'abonner aux changements dans la table messages 
        // pour rafraîchir la liste (dernier message, non-lus)
        const channel = supabase
            .channel('conversations-list-updates')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'messages' },
                () => {
                    fetchConversations(true)
                    refreshUnread()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, fetchConversations, refreshUnread])

    const refresh = useCallback(() => {
        fetchConversations(true)
        refreshUnread()
    }, [fetchConversations, refreshUnread])

    const deleteConversation = async (conversationId: string) => {
        // Optimistic Update
        const previousConversations = [...conversations]
        setConversations(prev => prev.filter(c => c.id_conversation !== conversationId))

        try {
            await conversationService.deleteConversation(conversationId)
            refreshUnread()
        } catch (err) {
            console.error('[useConversations] delete error:', err)
            setConversations(previousConversations) // Rollback
            throw err
        }
    }

    return {
        conversations,
        isLoading,
        isRefreshing,
        error,
        totalUnread,
        refresh,
        deleteConversation
    }
}
