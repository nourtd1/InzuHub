import { useState, useCallback, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { messageService } from '../services/messageService'
import { conversationService } from '../services/conversationService'
import { useAuth } from './useAuth'
import { useToast } from '../store/ToastContext'
import type { MessageComplet, VisiteMetadata } from '../types/database.types'
import { useTranslation } from 'react-i18next'
import { AppState } from 'react-native'

interface UseChatReturn {
    messages: MessageComplet[]
    isLoading: boolean
    isSending: boolean
    hasMore: boolean
    isTyping: boolean
    sendMessage: (text: string) => Promise<void>
    sendVisiteProposition: (date: string, heure: string) => Promise<void>
    confirmerVisite: (visiteId: string, date: string, heure: string) => Promise<void>
    annulerVisite: (visiteId: string, date: string, heure: string) => Promise<void>
    loadMore: () => void
    markAsRead: () => void
    broadcastTyping: () => void
}

/**
 * Hook pour gérer une discussion en temps réel.
 */
export function useChat(conversationId: string): UseChatReturn {
    const { user } = useAuth()
    const { showToast } = useToast()
    const { t } = useTranslation()

    const [messages, setMessages] = useState<MessageComplet[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSending, setIsSending] = useState(false)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const [isTyping, setIsTyping] = useState(false)

    const limit = 30
    const channelRef = useRef<any>(null)
    const typingChannelRef = useRef<any>(null)

    // 1. Chargement initial
    const loadInitialMessages = useCallback(async () => {
        if (!conversationId) return
        setIsLoading(true)
        try {
            const data = await messageService.fetchMessages(conversationId, 0, limit)
            setMessages(data)
            setHasMore(data.length === limit)
            markAsRead()
        } catch (err) {
            console.error('[useChat] initial load error:', err)
        } finally {
            setIsLoading(false)
        }
    }, [conversationId])

    // 2. Marquer comme lu
    const markAsRead = useCallback(async () => {
        if (!conversationId || !user) return
        try {
            await conversationService.markAllAsRead(conversationId, user.id)
        } catch (err) {
            console.error('[useChat] markAsRead error:', err)
        }
    }, [conversationId, user])

    // 3. Temps réel & Presence
    useEffect(() => {
        if (!conversationId || !user) return

        loadInitialMessages()

        // Canal pour les nouveaux messages
        const channel = supabase
            .channel(`chat-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `id_conversation=eq.${conversationId}`
                },
                async (payload) => {
                    const newMsg = payload.new as any
                    if (newMsg.id_expediteur === user.id) return

                    // Récupérer l'expéditeur pour avoir l'objet complet
                    const { data: expediteur } = await supabase
                        .from('utilisateurs')
                        .select('id_utilisateur, nom_complet, avatar_url')
                        .eq('id_utilisateur', newMsg.id_expediteur)
                        .single()

                    const fullMsg: MessageComplet = {
                        ...newMsg,
                        expediteur
                    }

                    setMessages(prev => [fullMsg, ...prev])
                    markAsRead()
                }
            )
            .subscribe()

        channelRef.current = channel

        // Canal pour le Typing Indicator via Presence
        const typingChannel = supabase.channel(`typing-${conversationId}`)

        typingChannel
            .on('presence', { event: 'sync' }, () => {
                const state = typingChannel.presenceState()
                const otherTyping = Object.values(state)
                    .flat()
                    .some((p: any) => p.userId !== user.id && p.typing)
                setIsTyping(otherTyping)
            })
            .subscribe()

        typingChannelRef.current = typingChannel

        // Gérer le retour au premier plan pour marquer comme lu
        const appStateSub = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') markAsRead()
        })

        return () => {
            supabase.removeChannel(channel)
            supabase.removeChannel(typingChannel)
            appStateSub.remove()
        }
    }, [conversationId, user, loadInitialMessages, markAsRead])

    // 4. Typing Indicator Broadcast
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const broadcastTyping = () => {
        if (!typingChannelRef.current || !user) return

        typingChannelRef.current.track({ typing: true, userId: user.id })

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => {
            typingChannelRef.current?.track({ typing: false, userId: user.id })
        }, 3000)
    }

    // 5. Actions
    const sendMessage = async (text: string) => {
        if (!text.trim() || !user || !conversationId) return

        const tempId = `temp-${Date.now()}`
        const tempMessage: MessageComplet = {
            id_message: tempId,
            id_conversation: conversationId,
            id_expediteur: user.id,
            contenu: text,
            type: 'texte',
            metadata: null,
            lu: false,
            date_envoi: new Date().toISOString(),
            expediteur: {
                id_utilisateur: user.id,
                nom_complet: user.user_metadata?.nom_complet || 'Moi',
                avatar_url: user.user_metadata?.avatar_url || null
            }
        }

        // Optimistic UI
        setMessages(prev => [tempMessage, ...prev])
        setIsSending(true)

        try {
            const real = await messageService.sendMessage(conversationId, user.id, text)
            setMessages(prev => prev.map(m => m.id_message === tempId ? real : m))
        } catch (err) {
            console.error('[useChat] sendMessage error:', err)
            setMessages(prev => prev.filter(m => m.id_message !== tempId))
            showToast({ message: t('chat.send_error'), type: 'error' })
        } finally {
            setIsSending(false)
            typingChannelRef.current?.track({ typing: false, userId: user.id })
        }
    }

    const sendVisiteProposition = async (date: string, heure: string) => {
        if (!user || !conversationId) return
        setIsSending(true)
        try {
            const msg = await messageService.sendVisiteProposition(conversationId, user.id, date, heure)
            setMessages(prev => [msg, ...prev])
        } catch (err) {
            console.error('[useChat] sendVisiteProposition error:', err)
            showToast({ message: t('chat.send_error'), type: 'error' })
        } finally {
            setIsSending(false)
        }
    }

    const confirmerVisite = async (visiteId: string, date: string, heure: string) => {
        if (!user || !conversationId) return
        try {
            const msg = await messageService.updateVisiteStatus(conversationId, user.id, visiteId, 'confirmee', date, heure)
            setMessages(prev => [msg, ...prev])
        } catch (err) {
            console.error('[useChat] confirmerVisite error:', err)
            showToast({ message: t('chat.send_error'), type: 'error' })
        }
    }

    const annulerVisite = async (visiteId: string, date: string, heure: string) => {
        if (!user || !conversationId) return
        try {
            const msg = await messageService.updateVisiteStatus(conversationId, user.id, visiteId, 'annulee', date, heure)
            setMessages(prev => [msg, ...prev])
        } catch (err) {
            console.error('[useChat] annulerVisite error:', err)
            showToast({ message: t('chat.send_error'), type: 'error' })
        }
    }

    const loadMore = async () => {
        if (!hasMore || isLoading || !conversationId) return
        const nextPage = page + 1
        try {
            const data = await messageService.fetchMessages(conversationId, nextPage, limit)
            if (data.length > 0) {
                setMessages(prev => [...prev, ...data])
                setPage(nextPage)
            }
            setHasMore(data.length === limit)
        } catch (err) {
            console.error('[useChat] loadMore error:', err)
        }
    }

    return {
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
        markAsRead,
        broadcastTyping
    }
}
