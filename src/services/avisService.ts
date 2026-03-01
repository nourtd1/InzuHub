import { supabase } from '../lib/supabase';
import { Avis, AvisComplet, StatsProprietaire } from '../types/database.types';

export interface CreateAvisData {
    id_proprietaire: string;
    id_visite: string;
    id_propriete: string;
    note: 1 | 2 | 3 | 4 | 5;
    commentaire?: string;
}

export const avisService = {
    async fetchAvisProprietaire(proprietaireId: string, limit: number = 20): Promise<AvisComplet[]> {
        const { data, error } = await supabase
            .from('avis')
            .select(`
                *,
                auteur:utilisateurs!avis_id_auteur_fkey(id_utilisateur, nom_complet, avatar_url),
                propriete:proprietes!avis_id_propriete_fkey(titre)
            `)
            .eq('id_proprietaire', proprietaireId)
            .order('date_avis', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // Handle array/object normalization like before
        return (data as any[]).map(a => {
            const aut = Array.isArray(a.auteur) ? a.auteur[0] : a.auteur;
            const prop = Array.isArray(a.propriete) ? a.propriete[0] : a.propriete;
            return {
                ...a,
                auteur: aut,
                propriete: prop
            } as AvisComplet;
        });
    },

    async fetchStatsProprietaire(proprietaireId: string): Promise<StatsProprietaire | null> {
        const { data, error } = await supabase
            .from('stats_proprietaires')
            .select('*')
            .eq('id_proprietaire', proprietaireId)
            .maybeSingle();

        if (error) throw error;
        return data as StatsProprietaire | null;
    },

    async canLeaveAvis(userId: string, visiteId: string): Promise<boolean> {
        // 1. Visite exists and statut = 'confirmee', date_visite in the past, user is locataire
        const { data: visite, error: visiteError } = await supabase
            .from('visites')
            .select('statut, date_visite, conversation:conversations!inner(id_locataire)')
            .eq('id_visite', visiteId)
            .single();

        if (visiteError || !visite) return false;

        const conv = Array.isArray(visite.conversation) ? visite.conversation[0] : visite.conversation;

        if (visite.statut !== 'confirmee') return false;
        if (conv.id_locataire !== userId) return false;
        if (new Date(visite.date_visite) >= new Date()) return false;

        // 3. Not already an avis for this visit
        const { count, error: countError } = await supabase
            .from('avis')
            .select('*', { count: 'exact', head: true })
            .eq('id_auteur', userId)
            .eq('id_visite', visiteId);

        if (countError) return false;
        return (count === 0);
    },

    async createAvis(data: CreateAvisData): Promise<Avis> {
        const { data: userAuth } = await supabase.auth.getUser();
        if (!userAuth.user) throw new Error('Not authenticated');

        const { data: avis, error } = await supabase
            .from('avis')
            .insert({
                ...data,
                id_auteur: userAuth.user.id
            })
            .select()
            .single();

        if (error) throw error;
        return avis as Avis;
    },

    async deleteAvis(avisId: string): Promise<void> {
        const { error } = await supabase
            .from('avis')
            .delete()
            .eq('id_avis', avisId);

        if (error) throw error;
    },

    async getMyAvis(userId: string, visiteId: string): Promise<Avis | null> {
        const { data, error } = await supabase
            .from('avis')
            .select('*')
            .eq('id_auteur', userId)
            .eq('id_visite', visiteId)
            .maybeSingle();

        if (error) throw error;
        return data as Avis | null;
    }
};
