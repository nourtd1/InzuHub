import { supabase } from '../lib/supabase';
import { Visite, VisiteComplete } from '../types/database.types';
import { messageService } from './messageService';

export const visiteService = {
    async proposeVisite(conversationId: string, dateVisite: Date): Promise<Visite> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Non authentifié');

        // 1. INSERT dans visites
        const { data: visite, error: visiteError } = await supabase
            .from('visites')
            .insert({
                id_conversation: conversationId,
                date_visite: dateVisite.toISOString(),
                statut: 'proposee'
            })
            .select()
            .single();

        if (visiteError) throw visiteError;

        // 2. Envoyer un message de type 'visite_proposee'
        const payload = JSON.stringify({
            id_visite: visite.id_visite,
            date_visite: visite.date_visite
        });

        await messageService.sendMessage(conversationId, user.user.id, payload, 'visite_proposee');

        return visite;
    },

    async confirmerVisite(visiteId: string): Promise<Visite> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Non authentifié');

        // 1. UPDATE visites
        const { data: visite, error: visiteError } = await supabase
            .from('visites')
            .update({ statut: 'confirmee' } as any)
            .eq('id_visite', visiteId)
            .select()
            .single();

        if (visiteError) throw visiteError;

        // 2. Envoyer message
        const payload = JSON.stringify({
            id_visite: visite.id_visite,
            date_visite: visite.date_visite
        });

        await messageService.sendMessage(visite.id_conversation, user.user.id, payload, 'visite_confirmee');

        return visite;
    },

    async annulerVisite(visiteId: string): Promise<Visite> {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('Non authentifié');

        const { data: visite, error: visiteError } = await supabase
            .from('visites')
            .update({ statut: 'annulee' } as any)
            .eq('id_visite', visiteId)
            .select()
            .single();

        if (visiteError) throw visiteError;

        return visite;
    },

    async getVisiteActive(conversationId: string): Promise<Visite | null> {
        const { data, error } = await supabase
            .from('visites')
            .select('*')
            .eq('id_conversation', conversationId)
            .in('statut', ['proposee', 'confirmee'])
            .order('date_creation', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Erreur getVisiteActive", error);
            return null;
        }
        return data;
    },

    async getVisitesConversation(conversationId: string): Promise<Visite[]> {
        const { data, error } = await supabase
            .from('visites')
            .select('*')
            .eq('id_conversation', conversationId)
            .order('date_visite', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    async isCreneauDisponible(proprietaireId: string, dateVisite: Date, dureeMinutes: number = 60): Promise<boolean> {
        const dateStart = new Date(dateVisite);
        const dateEnd = new Date(dateVisite.getTime() + dureeMinutes * 60000);

        const { data, error } = await supabase
            .from('visites')
            .select(`
            id_visite,
            date_visite,
            conversations!inner(id_proprietaire)
       `)
            .eq('statut', 'confirmee')
            .eq('conversations.id_proprietaire', proprietaireId);

        if (error) return true;

        for (const v of data) {
            const vDate = new Date(v.date_visite);
            const vEnd = new Date(vDate.getTime() + dureeMinutes * 60000);

            if (dateStart < vEnd && dateEnd > vDate) {
                return false;
            }
        }
        return true;
    },

    async getVisiteComplete(visiteId: string): Promise<VisiteComplete | null> {
        const { data: visite, error } = await supabase
            .from('visites')
            .select(`
                *,
                conversation:conversations (
                    *,
                    propriete:proprietes (
                        *,
                        photos (*),
                        quartier:quartiers (*)
                    ),
                    locataire:utilisateurs!conversations_id_locataire_fkey (
                        id_utilisateur, nom_complet, numero_telephone, avatar_url
                    ),
                    proprietaire:utilisateurs!conversations_id_proprietaire_fkey (
                        id_utilisateur, nom_complet, numero_telephone, avatar_url, statut_verification
                    )
                )
            `)
            .eq('id_visite', visiteId)
            .single();

        if (error) {
            console.error("Error fetching getVisiteComplete", error);
            return null;
        }

        return visite as unknown as VisiteComplete;
    }
};
