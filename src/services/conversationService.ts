import { supabase } from '../lib/supabase'
import type { ConversationComplete } from '../types/database.types'

/**
 * Service pour la gestion des conversations entre locataires et propriétaires.
 */
export const conversationService = {
    /**
     * Récupérer toutes les conversations de l'utilisateur.
     * Triées par derniere_activite DESC.
     * Inclut le dernier message + nombre de messages non-lus.
     */
    async fetchConversations(userId: string): Promise<ConversationComplete[]> {
        const { data, error } = await (supabase.from('conversations') as any)
            .select(`
        id_conversation,
        id_locataire,
        id_proprietaire,
        id_propriete,
        derniere_activite,
        locataire:utilisateurs!id_locataire(id_utilisateur, nom_complet, avatar_url, statut_verification, numero_telephone),
        proprietaire:utilisateurs!id_proprietaire(id_utilisateur, nom_complet, avatar_url, statut_verification, numero_telephone),
        propriete:proprietes(
          id_propriete,
          titre,
          prix_mensuel,
          quartier:quartiers(nom_quartier),
          photos(url_photo, est_photo_principale)
        )
      `)
            .or(`id_locataire.eq.${userId},id_proprietaire.eq.${userId}`)
            .order('derniere_activite', { ascending: false })

        if (error) {
            console.error('[conversationService] fetchConversations error:', error)
            throw error
        }

        if (!data) return []

        // Enrichissement manuel pour le dernier message et le compteur de non-lus
        const conversations = await Promise.all(data.map(async (conv: any) => {
            // 1. Récupérer le dernier message
            const { data: messages } = await (supabase.from('messages') as any)
                .select('*')
                .eq('id_conversation', conv.id_conversation)
                .order('date_envoi', { ascending: false })
                .limit(1)
                .single()

            // 2. Compter les non-lus
            const { count: unreadCount } = await (supabase.from('messages') as any)
                .select('*', { count: 'exact', head: true })
                .eq('id_conversation', conv.id_conversation)
                .eq('lu', false)
                .neq('id_expediteur', userId)

            // Filtrer les photos pour n'avoir que la principale ou la première
            const photos = conv.propriete?.photos || []
            const formattedPhotos = photos.map((p: any) => ({
                url_photo: p.url_photo,
                est_photo_principale: p.est_photo_principale
            }))

            return {
                ...conv,
                locataire: Array.isArray(conv.locataire) ? conv.locataire[0] : conv.locataire,
                proprietaire: Array.isArray(conv.proprietaire) ? conv.proprietaire[0] : conv.proprietaire,
                propriete: {
                    ...conv.propriete,
                    quartier: Array.isArray(conv.propriete.quartier) ? conv.propriete.quartier[0] : conv.propriete.quartier,
                    photos: formattedPhotos
                },
                dernier_message: messages || null,
                non_lus: unreadCount || 0
            } as ConversationComplete
        }))

        return conversations
    },

    /**
     * Créer ou récupérer une conversation existante.
     * Gère la contrainte UNIQUE(id_locataire, id_propriete).
     */
    async getOrCreateConversation(
        locataireId: string,
        proprietaireId: string,
        proprieteId: string
    ): Promise<string> {
        // 1. Tenter de récupérer l'existante
        const { data: existing } = await (supabase.from('conversations') as any)
            .select('id_conversation')
            .eq('id_locataire', locataireId)
            .eq('id_propriete', proprieteId)
            .maybeSingle()

        if (existing) {
            return existing.id_conversation
        }

        // 2. Créer si n'existe pas
        const { data: newConv, error } = await (supabase.from('conversations') as any)
            .insert({
                id_locataire: locataireId,
                id_proprietaire: proprietaireId,
                id_propriete: proprieteId,
                derniere_activite: new Date().toISOString()
            })
            .select('id_conversation')
            .single()

        if (error) {
            // En cas de conflit (race condition), on re-tente le select
            if (error.code === '23505') {
                const { data: retry } = await (supabase.from('conversations') as any)
                    .select('id_conversation')
                    .eq('id_locataire', locataireId)
                    .eq('id_propriete', proprieteId)
                    .single()
                if (retry) return retry.id_conversation
            }
            throw error
        }

        return newConv.id_conversation
    },

    /**
     * Supprimer une conversation et tous ses messages.
     */
    async deleteConversation(conversationId: string): Promise<void> {
        const { error } = await (supabase.from('conversations') as any)
            .delete()
            .eq('id_conversation', conversationId)

        if (error) throw error
    },

    /**
     * Marquer tous les messages d'une conversation comme lus.
     */
    async markAllAsRead(conversationId: string, userId: string): Promise<void> {
        const { error } = await (supabase.from('messages') as any)
            .update({ lu: true })
            .eq('id_conversation', conversationId)
            .neq('id_expediteur', userId)
            .eq('lu', false)

        if (error) {
            console.error('[conversationService] markAllAsRead error:', error)
        }
    },

    /**
     * Compter le total des messages non lus de l'utilisateur.
     */
    async countTotalUnread(userId: string): Promise<number> {
        const { count, error } = await (supabase.from('messages') as any)
            .select('id_message, id_conversation', { count: 'exact', head: true })
            .neq('id_expediteur', userId)
            .eq('lu', false)
        // Note: RLS s'assure que l'utilisateur ne compte que les messages 
        // des conversations dont il fait partie.

        if (error) {
            console.error('[conversationService] countTotalUnread error:', error)
            return 0
        }

        return count || 0
    }
}
