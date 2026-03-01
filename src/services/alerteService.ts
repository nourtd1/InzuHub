import { supabase } from '../lib/supabase';
import { Alerte, AlerteAvecQuartier, Propriete } from '../types/database.types';

export interface CreateAlerteData {
    nom_alerte: string;
    id_quartier?: string;
    prix_min?: number;
    prix_max?: number;
    nombre_chambres?: number;
    has_eau?: boolean;
    has_electricite?: boolean;
}

export const alerteService = {
    async fetchAlertes(userId: string): Promise<AlerteAvecQuartier[]> {
        const { data, error } = await supabase
            .from('alertes')
            .select(`
                *,
                quartier:quartiers(id_quartier, nom_quartier)
            `)
            .eq('id_utilisateur', userId)
            .order('date_creation', { ascending: false });

        if (error) throw error;
        // The return type should be cast safely because of the Join with quartiers
        return data as unknown as AlerteAvecQuartier[];
    },

    async createAlerte(userId: string, alerteData: CreateAlerteData): Promise<Alerte> {
        // Enforce max 5 limits locally before creating
        const { count, error: countError } = await supabase
            .from('alertes')
            .select('*', { count: 'exact', head: true })
            .eq('id_utilisateur', userId);

        if (countError) throw countError;
        if (count !== null && count >= 5) {
            throw new Error('Limite de 5 alertes atteinte');
        }

        const { data, error } = await supabase
            .from('alertes')
            .insert({
                id_utilisateur: userId,
                nom_alerte: alerteData.nom_alerte,
                id_quartier: alerteData.id_quartier || null,
                prix_min: alerteData.prix_min || null,
                prix_max: alerteData.prix_max || null,
                nombre_chambres: alerteData.nombre_chambres || null,
                has_eau: alerteData.has_eau ?? null,
                has_electricite: alerteData.has_electricite ?? null,
                est_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data as unknown as Alerte;
    },

    async updateAlerte(alerteId: string, alerteData: Partial<CreateAlerteData>): Promise<Alerte> {
        const { data, error } = await supabase
            .from('alertes')
            .update({
                nom_alerte: alerteData.nom_alerte,
                id_quartier: alerteData.id_quartier || null,
                prix_min: alerteData.prix_min || null,
                prix_max: alerteData.prix_max || null,
                nombre_chambres: alerteData.nombre_chambres || null,
                has_eau: alerteData.has_eau ?? null,
                has_electricite: alerteData.has_electricite ?? null,
            })
            .eq('id_alerte', alerteId)
            .select()
            .single();

        if (error) throw error;
        return data as unknown as Alerte;
    },

    async toggleAlerte(alerteId: string, active: boolean): Promise<void> {
        const { error } = await supabase
            .from('alertes')
            .update({ est_active: active })
            .eq('id_alerte', alerteId);

        if (error) throw error;
    },

    async deleteAlerte(alerteId: string): Promise<void> {
        const { error } = await supabase
            .from('alertes')
            .delete()
            .eq('id_alerte', alerteId);

        if (error) throw error;
    },

    async findMatchingProperties(criteria: CreateAlerteData): Promise<Propriete[]> {
        let query = supabase
            .from('proprietes')
            .select('*')
            .eq('statut', 'disponible')
            .order('date_publication', { ascending: false })
            .limit(5);

        if (criteria.id_quartier) {
            query = query.eq('id_quartier', criteria.id_quartier);
        }
        if (criteria.prix_min) {
            query = query.gte('prix_mensuel', criteria.prix_min);
        }
        if (criteria.prix_max) {
            query = query.lte('prix_mensuel', criteria.prix_max);
        }
        if (criteria.nombre_chambres) {
            query = query.gte('nombre_chambres', criteria.nombre_chambres);
        }
        if (criteria.has_eau) {
            query = query.eq('has_eau', true);
        }
        if (criteria.has_electricite) {
            query = query.eq('has_electricite', true);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Propriete[];
    }
};
