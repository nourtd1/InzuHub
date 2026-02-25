import { supabase } from '../lib/supabase';
import { Utilisateur } from '../types/database.types';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface ProfileStats {
    totalAnnonces: number;
    annoncesDisponibles: number;
    annoncesLouees: number;
    totalConversations: number;
    totalVisites: number;
    visitesConfirmees: number;
    visitesPrecedentes: number;
    conversationsActives: number;
}

export const profileService = {
    async updateProfile(
        userId: string,
        data: Partial<Pick<Utilisateur, 'nom_complet' | 'numero_telephone' | 'avatar_url'>>
    ): Promise<Utilisateur> {
        const { data: user, error } = await supabase
            .from('utilisateurs')
            .update(data as any)
            .eq('id_utilisateur', userId)
            .select()
            .single();

        if (error) throw error;
        return user;
    },

    async uploadAvatar(userId: string, imageUri: string): Promise<string> {
        try {
            const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' });
            const filePath = `${userId}/avatar_${Date.now()}.jpg`;

            // Supprimer potentiellement l'ancien avatar s'il existe dans le dossier (Optionnel, on met juste un nouveau tag pour l'instant)

            const { error } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });

            if (error) throw error;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            await this.updateProfile(userId, { avatar_url: publicUrl });

            return publicUrl;
        } catch (error) {
            console.error("Erreur lors de l'upload de l'avatar", error);
            throw error;
        }
    },

    async fetchProfileStats(userId: string): Promise<ProfileStats> {
        // Obtenir le profil pour connaître le rôle
        const { data: user } = await supabase.from('utilisateurs').select('role').eq('id_utilisateur', userId).single();
        const role = user?.role || 'locataire';

        const stats: ProfileStats = {
            totalAnnonces: 0,
            annoncesDisponibles: 0,
            annoncesLouees: 0,
            totalConversations: 0,
            totalVisites: 0,
            visitesConfirmees: 0,
            visitesPrecedentes: 0,
            conversationsActives: 0
        };

        if (role === 'proprietaire') {
            // Stats Proprio
            const { data: annonces } = await supabase.from('proprietes').select('statut').eq('id_utilisateur', userId);
            if (annonces) {
                stats.totalAnnonces = annonces.length;
                stats.annoncesDisponibles = annonces.filter(a => a.statut === 'disponible').length;
                stats.annoncesLouees = annonces.filter(a => a.statut === 'loue').length;
            }

            const { count: convCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('id_proprietaire', userId);
            stats.totalConversations = convCount || 0;

        } else {
            // Stats Locataire
            const { data: visites } = await supabase.from('visites')
                .select('statut, date_visite, conversations!inner(id_locataire)')
                .eq('conversations.id_locataire', userId);

            if (visites) {
                stats.totalVisites = visites.length;
                stats.visitesConfirmees = visites.filter(v => v.statut === 'confirmee').length;
                stats.visitesPrecedentes = visites.filter(v => new Date(v.date_visite) < new Date()).length;
            }

            const { count: convCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('id_locataire', userId);
            stats.conversationsActives = convCount || 0;
        }

        return stats;
    },

    async deleteAccount(userId: string): Promise<void> {
        // Appelez une edge function ou delete_user() function RPC si disponible
        // Pour ce test, si on n'a pas auth.admin, une RPC est mieux

        // 1. Essais de suppression depuis avatars/
        try {
            // (On ne peut lister facilement sans ref, mais dans une vraie APP, vider le dossier utilisateur via edge fonction)
        } catch (e) { }

        const { error } = await supabase.rpc('delete_user');
        if (error) {
            console.error("Ensure you have set up a delete_user RPC or Edge Function for self-deletion", error);
            // Fallback (ne supprime que metadata mais pas auth account complet depuis JS client)
            await supabase.from('utilisateurs').delete().eq('id_utilisateur', userId);
        }
    }
};
