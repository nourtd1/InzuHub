import { supabase } from '../lib/supabase';
import { Database, ProprieteAvecPhotos, ProprieteComplete, Propriete, Quartier, Utilisateur } from '../types/database.types';

export interface PropertyFilters {
    id_quartier?: string;
    prix_min?: number;
    prix_max?: number;
    nombre_chambres?: number;
    has_eau?: boolean;
    has_electricite?: boolean;
    searchQuery?: string;
    mustHaveCoordinates?: boolean;
}

export interface CreatePropertyData {
    titre: string;
    description: string;
    prix_mensuel: number;
    garantie_exigee: number;
    nombre_chambres: number;
    nombre_salons: number;
    has_eau: boolean;
    has_electricite: boolean;
    has_cloture: boolean;
    has_parking: boolean;
    id_quartier: string;
    id_utilisateur: string;
    statut: 'disponible' | 'en_cours' | 'loue';
    latitude?: number | null;
    longitude?: number | null;
}

export const propertyService = {
    /**
     * Récupérer les annonces disponibles avec jointures
     */
    async fetchProperties(filters: PropertyFilters = {}): Promise<ProprieteAvecPhotos[]> {
        let query = supabase
            .from('proprietes')
            .select(`
        *,
        photos (*),
        quartier:quartiers(*),
        proprietaire:utilisateurs!proprietes_id_utilisateur_fkey(nom_complet, statut_verification, avatar_url)
      `)
            .order('date_publication', { ascending: false });

        // Filtre par défaut : uniquement les disponibles sauf si spécifié autrement (logique à revoir ?)
        // Le prompt demande "Filtrer uniquement statut = 'disponible' par défaut"
        query = query.eq('statut', 'disponible');

        if (filters.id_quartier) {
            query = query.eq('id_quartier', filters.id_quartier);
        }

        if (filters.prix_min !== undefined) {
            query = query.gte('prix_mensuel', filters.prix_min);
        }

        if (filters.prix_max !== undefined) {
            query = query.lte('prix_mensuel', filters.prix_max);
        }

        if (filters.nombre_chambres !== undefined) {
            query = query.gte('nombre_chambres', filters.nombre_chambres);
        }

        if (filters.has_eau) {
            query = query.eq('has_eau', true);
        }

        if (filters.has_electricite) {
            query = query.eq('has_electricite', true);
        }

        if (filters.searchQuery) {
            // Recherche textuelle sur titre ou description
            // Note: Supabase text search syntax depends on configuration
            // Using ilike for simplicity on title first
            query = query.ilike('titre', `%${filters.searchQuery}%`);
        }

        if (filters.mustHaveCoordinates) {
            query = query.not('latitude', 'is', null);
        }

        const { data, error } = await query.limit(20);

        if (error) {
            console.error('Error fetching properties:', error);
            throw error;
        }

        return data as unknown as ProprieteAvecPhotos[];
    },

    /**
     * Récupérer une annonce complète avec propriétaire et quartier
     */
    async fetchPropertyById(id: string): Promise<ProprieteComplete | null> {
        const { data, error } = await supabase
            .from('proprietes')
            .select(`
        *,
        photos (*),
        quartier:quartiers(*),
        proprietaire:utilisateurs!proprietes_id_utilisateur_fkey(nom_complet, numero_telephone, statut_verification, avatar_url)
      `)
            .eq('id_propriete', id)
            .single();

        if (error) {
            console.error('Error fetching property by id:', error);
            return null;
        }

        return data as unknown as ProprieteComplete;
    },

    /**
     * Récupérer les annonces d'un propriétaire
     */
    async fetchMyProperties(userId: string): Promise<ProprieteAvecPhotos[]> {
        const { data, error } = await supabase
            .from('proprietes')
            .select(`
        *,
        photos (*)
      `)
            .eq('id_utilisateur', userId)
            .order('date_publication', { ascending: false });

        if (error) {
            console.error('Error fetching my properties:', error);
            throw error;
        }

        return data as unknown as ProprieteAvecPhotos[];
    },

    /**
     * Créer une nouvelle annonce
     */
    async createProperty(propertyData: CreatePropertyData): Promise<Propriete> {
        const { data, error } = await supabase
            .from('proprietes')
            // @ts-ignore
            .insert(propertyData as any)
            .select()
            .single();

        if (error) {
            console.error('Error creating property:', error);
            throw error;
        }

        return data;
    },

    /**
     * Mettre à jour le statut d'une annonce
     */
    async updatePropertyStatus(
        id: string,
        statut: 'disponible' | 'en_cours' | 'loue'
    ): Promise<void> {
        const { error } = await supabase
            .from('proprietes')
            // @ts-ignore
            .update({ statut } as any)
            .eq('id_propriete', id);

        if (error) {
            console.error('Error updating property status:', error);
            throw error;
        }
    },

    /**
     * Supprimer une annonce
     */
    async deleteProperty(id: string): Promise<void> {
        const { error } = await supabase
            .from('proprietes')
            .delete()
            .eq('id_propriete', id);

        if (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    },

    /**
     * Récupérer la liste des quartiers
     */
    async fetchQuartiers(): Promise<Quartier[]> {
        const { data, error } = await supabase
            .from('quartiers')
            .select('*')
            .order('nom_quartier', { ascending: true });

        if (error) {
            console.error('Error fetching quartiers:', error);
            return [];
        }

        return data;
    }
};
