import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FavoriAvecPropriete } from '../types/database.types';
import { favoriService } from '../services/favoriService';

interface UseFavorisReturn {
    favoris: FavoriAvecPropriete[];
    favorisIds: Set<string>;
    count: number;
    isLoading: boolean;
    isRefreshing: boolean;
    isFavori: (propertyId: string) => boolean;
    toggleFavori: (propertyId: string) => Promise<void>;
    refreshFavoris: () => Promise<void>;
}

export function useFavorisInternal(userId: string | undefined): UseFavorisReturn {
    const [favoris, setFavoris] = useState<FavoriAvecPropriete[]>([]);
    const [favorisIds, setFavorisIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshFavoris = useCallback(async (isImmediate = false) => {
        if (!userId) {
            setFavoris([]);
            setFavorisIds(new Set());
            setIsLoading(false);
            return;
        }

        if (!isImmediate) setIsRefreshing(true);
        try {
            const data = await favoriService.fetchFavoris(userId);
            setFavoris(data);
            setFavorisIds(new Set(data.map(f => f.id_propriete)));
        } catch (error) {
            console.error('Error fetching favoris:', error);
        } finally {
            setIsLoading(false);
            if (!isImmediate) setIsRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        setIsLoading(true);
        refreshFavoris(true);
    }, [refreshFavoris]);

    const isFavori = useCallback((propertyId: string) => {
        return favorisIds.has(propertyId);
    }, [favorisIds]);

    const toggleFavori = useCallback(async (propertyId: string) => {
        if (!userId) return;

        const isCurrentlyFavori = favorisIds.has(propertyId);

        // Optimistic update
        setFavorisIds(prev => {
            const next = new Set(prev);
            if (isCurrentlyFavori) {
                next.delete(propertyId);
            } else {
                next.add(propertyId);
            }
            return next;
        });

        if (isCurrentlyFavori) {
            setFavoris(prev => prev.filter(f => f.id_propriete !== propertyId));
        }

        try {
            const result = await favoriService.toggleFavori(userId, propertyId);
            if (result.isFavori && !isCurrentlyFavori) {
                // Background refresh to get the full property object
                refreshFavoris(true);
            } else if (!result.isFavori && isCurrentlyFavori) {
                // Nothing to do, already removed
            } else {
                // Revert if out of sync
                refreshFavoris(true);
            }
        } catch (error) {
            console.error('Error toggling favori:', error);
            // Revert optimistic update
            setFavorisIds(prev => {
                const next = new Set(prev);
                if (isCurrentlyFavori) {
                    next.add(propertyId);
                } else {
                    next.delete(propertyId);
                }
                return next;
            });
            refreshFavoris(true);
            throw error;
        }
    }, [userId, favorisIds, refreshFavoris]);

    return {
        favoris,
        favorisIds,
        count: favorisIds.size,
        isLoading,
        isRefreshing,
        isFavori,
        toggleFavori,
        refreshFavoris,
    };
}
