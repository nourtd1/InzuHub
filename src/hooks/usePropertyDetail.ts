import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { useAuth } from './useAuth';
import { propertyService } from '../services/propertyService';
import { signalementService } from '../services/signalementService';
import { conversationService } from '../services/conversationService';
import { ProprieteComplete } from '../types/database.types';

export interface UsePropertyDetailReturn {
    property: ProprieteComplete | null;
    isLoading: boolean;
    error: string | null;
    isOwnProperty: boolean;
    hasReported: boolean;
    isContactLoading: boolean;
    handleContact: () => Promise<void>;
    handleReport: (motif: string) => Promise<void>;
    refresh: () => void;
}

export function usePropertyDetail(id: string): UsePropertyDetailReturn {
    const { user } = useAuth();
    const [property, setProperty] = useState<ProprieteComplete | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasReported, setHasReported] = useState(false);
    const [isContactLoading, setIsContactLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const isOwnProperty = Boolean(user && property && user.id === property.id_utilisateur);

    useEffect(() => {
        let isMounted = true;
        const loadPropertyAndUserData = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);

            try {
                // Fetch property
                const data = await propertyService.fetchPropertyById(id);
                if (!isMounted) return;

                if (!data) {
                    setError('Propriété introuvable.');
                    return;
                }
                setProperty(data);

                // Fetch user specific data
                if (user) {
                    const reported = await signalementService.hasAlreadyReported(user.id, id);
                    if (isMounted) setHasReported(reported);
                } else {
                    if (isMounted) setHasReported(false);
                }

            } catch (err) {
                if (isMounted) setError('Une erreur est survenue lors du chargement.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadPropertyAndUserData();
        return () => { isMounted = false; };
    }, [id, user, refreshTrigger]);

    const handleContact = async () => {
        if (!user) {
            router.push('/(auth)/login');
            return;
        }

        if (isOwnProperty || !property) return;

        setIsContactLoading(true);
        try {
            const conversationId = await conversationService.getOrCreateConversation(
                user.id,
                property.id_utilisateur,
                property.id_propriete
            );
            router.push(`/chat/${conversationId}`);
        } catch (err) {
            console.error('Contact error:', err);
            // In a real app, you might want to show a toast here
        } finally {
            setIsContactLoading(false);
        }
    };

    const handleReport = async (motif: string) => {
        if (!user || !property) {
            if (!user) router.push('/(auth)/login');
            return;
        }

        try {
            await signalementService.createSignalement({
                id_propriete: property.id_propriete,
                motif
            }, user.id);
            setHasReported(true);
        } catch (err) {
            console.error('Error reporting:', err);
            throw err; // Let the component handle display
        }
    };

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return {
        property,
        isLoading,
        error,
        isOwnProperty,
        hasReported,
        isContactLoading,
        handleContact,
        handleReport,
        refresh
    };
}
