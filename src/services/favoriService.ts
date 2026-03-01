import { supabase } from '../lib/supabase';
import { FavoriAvecPropriete } from '../types/database.types';

export const favoriService = {
    // Récupérer tous les favoris de l'utilisateur
    async fetchFavoris(userId: string): Promise<FavoriAvecPropriete[]> {
        const { data, error } = await supabase
            .from('favoris')
            .select(`
                id_favori,
                id_utilisateur,
                id_propriete,
                date_ajout,
                propriete:proprietes!inner(
                    id_propriete,
                    id_utilisateur,
                    id_quartier,
                    titre,
                    description,
                    prix_mensuel,
                    garantie_exigee,
                    nombre_chambres,
                    nombre_salons,
                    has_eau,
                    has_electricite,
                    has_cloture,
                    has_parking,
                    statut,
                    latitude,
                    longitude,
                    date_publication,
                    photos (
                        id_photo,
                        url_photo,
                        est_photo_principale
                    ),
                    quartier:quartiers (
                        id_quartier,
                        nom_quartier
                    ),
                    proprietaire:utilisateurs!proprietes_id_utilisateur_fkey (
                        nom_complet,
                        statut_verification
                    )
                )
            `)
            .eq('id_utilisateur', userId)
            .order('date_ajout', { ascending: false });

        if (error) throw error;

        // Transform the nested data correctly to match FavoriAvecPropriete
        // supabase returns single nested elements as an array or object depending on relation
        return (data as any[]).map(f => {
            // For a one-to-one or correctly nested object it usually returns an object, but sometimes we need to extract from array
            const prop = Array.isArray(f.propriete) ? f.propriete[0] : f.propriete;
            const q = Array.isArray(prop.quartier) ? prop.quartier[0] : prop.quartier;
            const propOwn = Array.isArray(prop.proprietaire) ? prop.proprietaire[0] : prop.proprietaire;

            return {
                id_favori: f.id_favori,
                id_utilisateur: f.id_utilisateur,
                id_propriete: f.id_propriete,
                date_ajout: f.date_ajout,
                propriete: {
                    ...prop,
                    quartier: q,
                    proprietaire: propOwn
                }
            };
        }) as FavoriAvecPropriete[];
    },

    // Vérifier si une propriété est en favori
    async isFavori(userId: string, propertyId: string): Promise<boolean> {
        const { count, error } = await supabase
            .from('favoris')
            .select('id_favori', { count: 'exact', head: true })
            .eq('id_utilisateur', userId)
            .eq('id_propriete', propertyId);

        if (error) throw error;
        return (count ?? 0) > 0;
    },

    // Ajouter aux favoris
    async addFavori(userId: string, propertyId: string): Promise<void> {
        const { error } = await supabase
            .from('favoris')
            .insert({
                id_utilisateur: userId,
                id_propriete: propertyId,
            });

        if (error) throw error;
    },

    // Retirer des favoris
    async removeFavori(userId: string, propertyId: string): Promise<void> {
        const { error } = await supabase
            .from('favoris')
            .delete()
            .eq('id_utilisateur', userId)
            .eq('id_propriete', propertyId);

        if (error) throw error;
    },

    // Toggle favori (ajouter si absent, retirer si présent)
    async toggleFavori(userId: string, propertyId: string): Promise<{ isFavori: boolean }> {
        const estFavori = await this.isFavori(userId, propertyId);
        if (estFavori) {
            await this.removeFavori(userId, propertyId);
            return { isFavori: false };
        } else {
            await this.addFavori(userId, propertyId);
            return { isFavori: true };
        }
    },

    // Compter les favoris de l'utilisateur
    async countFavoris(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('favoris')
            .select('id_favori', { count: 'exact', head: true })
            .eq('id_utilisateur', userId);

        if (error) throw error;
        return count ?? 0;
    }
};
