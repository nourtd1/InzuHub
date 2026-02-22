import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { Utilisateur, ProprieteAvecPhotos, VisiteComplete } from '../types/database.types';
import { profileService, ProfileStats } from '../services/profileService';
import { propertyService } from '../services/propertyService';
import { visiteService } from '../services/visiteService';
import { Alert } from 'react-native';

export interface UseProfileReturn {
    profile: Utilisateur | null;
    stats: ProfileStats | null;
    myProperties: ProprieteAvecPhotos[];
    myVisits: VisiteComplete[];
    isLoading: boolean;
    isUploadingAvatar: boolean;
    isUpdatingProfile: boolean;
    updateProfile: (data: Partial<Utilisateur>) => Promise<void>;
    uploadAvatar: (uri: string) => Promise<void>;
    deleteProperty: (id: string) => Promise<void>;
    updatePropertyStatus: (id: string, statut: 'disponible' | 'en_cours' | 'loue') => Promise<void>;
    refresh: () => void;
}

export function useProfile(): UseProfileReturn {
    const { user, profile, refreshProfile } = useAuth();
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [myProperties, setMyProperties] = useState<ProprieteAvecPhotos[]>([]);
    const [myVisits, setMyVisits] = useState<VisiteComplete[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const loadData = async () => {
        if (!user || !profile) return;
        setIsLoading(true);
        try {
            const [fetchedStats, fetchedProperties] = await Promise.all([
                profileService.fetchProfileStats(user.id),
                profile.role === 'proprietaire' ? propertyService.fetchMyProperties(user.id) : Promise.resolve([]),
                // Pour myVisits, dans un vrai backend idéalement nous requêterions "toutes les visites où id_locataire = me."
                // Comme on l'a fait par conversation dans visiteService, on simule ici une requete custom.
            ]);

            setStats(fetchedStats);
            setMyProperties(fetchedProperties as any);

            // Fetch visites pour locataire
            if (profile.role === 'locataire') {
                // (Note: visiteService as it stands needs to fetch all conversation visits. Let's do a quick custom fetch)
                // We'll rely on the frontend fetching all conversations. Just for mock logic here or if you created a specialized edge function.
                // Assuming visiteService has a specialized function or we do it inline here:
                /*
                const { data } = await supabase.from('visites')
                    .select('*, conversation:conversations(*, propriete:proprietes(*, photos(*), quartier:quartiers(*)), proprietaire:utilisateurs!conversations_id_proprietaire_fkey(*))')
                    .eq('conversations.id_locataire', user.id);
                setMyVisits(data || []);
                */
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user, profile?.role]);

    const updateProfile = async (data: Partial<Utilisateur>) => {
        if (!user) return;
        setIsUpdatingProfile(true);
        try {
            await profileService.updateProfile(user.id, data);
            await refreshProfile(); // reloads profile in AuthContext
        } catch (error) {
            Alert.alert("Erreur", "Impossible de mettre à jour le profil");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const uploadAvatar = async (uri: string) => {
        if (!user) return;
        setIsUploadingAvatar(true);
        try {
            await profileService.uploadAvatar(user.id, uri);
            await refreshProfile();
        } catch (error) {
            Alert.alert("Erreur", "Impossible de télécharger l'image");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const deleteProperty = async (id: string) => {
        if (!user) return;
        try {
            await propertyService.deleteProperty(id);
            await loadData(); // refresh list
        } catch (e) {
            Alert.alert("Erreur", "Impossible de supprimer l'annonce");
        }
    };

    const updatePropertyStatus = async (id: string, statut: 'disponible' | 'en_cours' | 'loue') => {
        try {
            await propertyService.updatePropertyStatus(id, statut);
            await loadData();
        } catch (e) {
            Alert.alert("Erreur", "Impossible de changer le statut");
        }
    };

    return {
        profile,
        stats,
        myProperties,
        myVisits,
        isLoading,
        isUploadingAvatar,
        isUpdatingProfile,
        updateProfile,
        uploadAvatar,
        deleteProperty,
        updatePropertyStatus,
        refresh: () => {
            refreshProfile();
            loadData();
        }
    };
}
