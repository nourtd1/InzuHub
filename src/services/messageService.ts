import { supabase } from '../lib/supabase'
import type { Message, MessageComplet, VisiteMetadata } from '../types/database.types'

/**
 * Service pour la gestion des messages et des visites associées.
 */
export const messageService = {
    /**
     * Récupère les messages d'une conversation (paginés).
     * Les plus récents en premier (FlatList inversée).
     */
    async fetchMessages(
        conversationId: string,
        page: number = 0,
        limit: number = 30
    ): Promise<MessageComplet[]> {
        const from = page * limit
        const to = from + limit - 1

        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        expediteur:utilisateurs!id_expediteur(
          id_utilisateur,
          nom_complet,
          avatar_url
        )
      `)
            .eq('id_conversation', conversationId)
            .order('date_envoi', { ascending: false })
            .range(from, to)

        if (error) {
            console.error('[messageService] fetchMessages error:', error)
            throw error
        }

        return ((data as any[]) || []).map((msg: any) => ({
            ...msg,
            expediteur: Array.isArray(msg.expediteur) ? msg.expediteur[0] : msg.expediteur
        })) as MessageComplet[]
    },

    /**
     * Envoyer un message texte simple.
     */
    async sendMessage(
        conversationId: string,
        expediteurId: string,
        contenu: string,
        type: Message['type'] = 'texte',
        metadata?: VisiteMetadata
    ): Promise<MessageComplet> {
        // 1. Insérer le message
        const { data: newMsg, error: insertError } = await supabase
            .from('messages')
            .insert({
                id_conversation: conversationId,
                id_expediteur: expediteurId,
                contenu,
                type,
                metadata,
                date_envoi: new Date().toISOString()
            })
            .select(`
        *,
        expediteur:utilisateurs!id_expediteur(
          id_utilisateur,
          nom_complet,
          avatar_url
        )
      `)
            .single()

        if (insertError) {
            console.error('[messageService] sendMessage insert error:', insertError)
            throw insertError
        }

        // 2. Mettre à jour la date d'activité de la conversation
        await supabase
            .from('conversations')
            .update({ derniere_activite: new Date().toISOString() })
            .eq('id_conversation', conversationId)

        return {
            ...(newMsg as any),
            expediteur: Array.isArray((newMsg as any).expediteur) ? (newMsg as any).expediteur[0] : (newMsg as any).expediteur
        } as MessageComplet
    },

    /**
     * Proposer une visite.
     * Crée un enregistrement dans 'visites' puis un message de type 'visite_proposee'.
     */
    async sendVisiteProposition(
        conversationId: string,
        expediteurId: string,
        dateVisite: string,
        heureVisite: string
    ): Promise<MessageComplet> {
        // 1. Récupérer les détails de la conversation pour id_propriete
        const { data: conv } = await supabase
            .from('conversations')
            .select('id_propriete')
            .eq('id_conversation', conversationId)
            .single()

        if (!conv) throw new Error('Conversation non trouvée')

        // 2. Insérer l'enregistrement de visite
        const { data: newVisite, error: visiteError } = await supabase
            .from('visites')
            .insert({
                id_conversation: conversationId,
                date_visite: `${dateVisite}T${heureVisite}:00`, // concaténation ISO simple
                statut: 'proposee'
            })
            .select('id_visite')
            .single()

        if (visiteError) throw visiteError

        // 3. Envoyer le message de type 'visite_proposee' via sendMessage
        return this.sendMessage(
            conversationId,
            expediteurId,
            '📅 Proposition de visite envoyée',
            'visite_proposee',
            {
                date_visite: dateVisite,
                heure_visite: heureVisite,
                id_visite: newVisite.id_visite
            }
        )
    },

    /**
     * Mettre à jour le statut d'une visite.
     */
    async updateVisiteStatus(
        conversationId: string,
        expediteurId: string,
        visiteId: string,
        newStatus: 'confirmee' | 'annulee',
        dateVisite: string,
        heureVisite: string
    ): Promise<MessageComplet> {
        // 1. Mettre à jour le statut dans la table visites
        const { error: visitUpdateError } = await supabase
            .from('visites')
            .update({ statut: newStatus })
            .eq('id_visite', visiteId)

        if (visitUpdateError) throw visitUpdateError

        // 2. Créer le message de notification correspondant
        const type = newStatus === 'confirmee' ? 'visite_confirmee' : 'visite_annulee'
        const contenu = newStatus === 'confirmee' ? '✅ Visite confirmée !' : '❌ Visite annulée'

        return this.sendMessage(
            conversationId,
            expediteurId,
            contenu,
            type,
            {
                id_visite: visiteId,
                date_visite: dateVisite,
                heure_visite: heureVisite
            }
        )
    }
}
