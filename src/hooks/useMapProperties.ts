import { useState, useEffect, useCallback } from 'react';
import { Region } from 'react-native-maps';
import { ProprieteAvecPhotos, Quartier, Utilisateur } from '../types/database.types';
import { propertyService } from '../services/propertyService';

export type MapProperty = ProprieteAvecPhotos & {
    quartier: Quartier;
    proprietaire: Pick<Utilisateur, 'nom_complet' | 'statut_verification' | 'avatar_url'>;
};

export interface MapFiltersState {
    nombre_chambres?: number;
    has_eau?: boolean;
    has_electricite?: boolean;
}

export interface UseMapPropertiesReturn {
    properties: MapProperty[];
    selectedProperty: MapProperty | null;
    isLoading: boolean;
    mapFilters: MapFiltersState;
    setMapFilters: (f: MapFiltersState) => void;
    selectProperty: (id: string | null) => void;
    visibleCount: number;
    onRegionChange: (region: Region) => void;
}

export function useMapProperties(): UseMapPropertiesReturn {
    const [properties, setProperties] = useState<MapProperty[]>([]);
    const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mapFilters, setMapFilters] = useState<MapFiltersState>({});
    const [currentRegion, setCurrentRegion] = useState<Region | null>(null);

    // Fetch properties
    useEffect(() => {
        let isMounted = true;
        const loadProperties = async () => {
            setIsLoading(true);
            try {
                // propertyService internally handles joins for quartier and proprietaire in fetchProperties
                const data = await propertyService.fetchProperties({
                    ...mapFilters,
                    mustHaveCoordinates: true, // Only fetch properties with location
                });

                if (isMounted) {
                    // Type assertion since we know the query in service includes these fields
                    setProperties(data as unknown as MapProperty[]);
                }
            } catch (error) {
                console.error('Error loading map properties:', error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadProperties();

        return () => {
            isMounted = false;
        };
    }, [mapFilters]);

    // Derived state for selection
    const selectedProperty = properties.find(p => p.id_propriete === selectedPropertyId) || null;

    const selectProperty = useCallback((id: string | null) => {
        setSelectedPropertyId(id);
    }, []);

    // Calculate visible properties
    const onRegionChange = useCallback((region: Region) => {
        setCurrentRegion(region);
    }, []);

    // Calculate how many properties are in the current viewport
    const visibleCount = currentRegion ? properties.filter(prop => {
        if (!prop.latitude || !prop.longitude) return false;

        // Simple bounding box check
        const minLat = currentRegion.latitude - currentRegion.latitudeDelta / 2;
        const maxLat = currentRegion.latitude + currentRegion.latitudeDelta / 2;
        const minLng = currentRegion.longitude - currentRegion.longitudeDelta / 2;
        const maxLng = currentRegion.longitude + currentRegion.longitudeDelta / 2;

        return prop.latitude >= minLat &&
            prop.latitude <= maxLat &&
            prop.longitude >= minLng &&
            prop.longitude <= maxLng;
    }).length : properties.length;

    return {
        properties,
        selectedProperty,
        isLoading,
        mapFilters,
        setMapFilters,
        selectProperty,
        visibleCount,
        onRegionChange
    };
}
