import { useState, useEffect, useCallback, useMemo } from 'react';
import { propertyService, PropertyFilters } from '../services/propertyService';
import { ProprieteAvecPhotos, Quartier } from '../types/database.types';
import { useFocusEffect } from 'expo-router';

export interface UsePropertiesReturn {
    properties: ProprieteAvecPhotos[];
    quartiers: Quartier[];
    isLoading: boolean;
    isRefreshing: boolean;
    filters: PropertyFilters;
    activeFiltersCount: number;
    setFilters: (f: PropertyFilters) => void;
    resetFilters: () => void;
    refresh: () => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
}

export function useProperties(): UsePropertiesReturn {
    const [properties, setProperties] = useState<ProprieteAvecPhotos[]>([]);
    const [quartiers, setQuartiers] = useState<Quartier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [searchQuery, setSearchQuery] = useState('');

    // Charger les quartiers au montage
    useEffect(() => {
        loadQuartiers();
    }, []);

    const loadQuartiers = async () => {
        try {
            const data = await propertyService.fetchQuartiers();
            setQuartiers(data);
        } catch (error) {
            console.error('Error loading quartiers:', error);
        }
    };

    // Charger les propriétés
    const loadProperties = useCallback(async (currentFilters: PropertyFilters, query: string) => {
        try {
            setIsLoading(true);
            const data = await propertyService.fetchProperties({
                ...currentFilters,
                searchQuery: query
            });
            setProperties(data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    // Gestion du debounce pour la recherche
    useEffect(() => {
        const timer = setTimeout(() => {
            loadProperties(filters, searchQuery);
        }, 400);

        return () => clearTimeout(timer);
    }, [filters, searchQuery, loadProperties]);

    const refresh = useCallback(() => {
        setIsRefreshing(true);
        loadProperties(filters, searchQuery);
    }, [filters, searchQuery, loadProperties]);

    const resetFilters = useCallback(() => {
        setFilters({});
        setSearchQuery('');
    }, []);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.id_quartier) count++;
        if (filters.prix_min !== undefined) count++;
        if (filters.prix_max !== undefined) count++;
        if (filters.nombre_chambres !== undefined) count++;
        if (filters.has_eau) count++;
        if (filters.has_electricite) count++;
        return count;
    }, [filters]);

    return {
        properties,
        quartiers,
        isLoading,
        isRefreshing,
        filters,
        activeFiltersCount,
        setFilters,
        resetFilters,
        refresh,
        searchQuery,
        setSearchQuery,
    };
}
