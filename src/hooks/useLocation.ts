import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface UseLocationReturn {
    userLocation: { latitude: number; longitude: number } | null;
    hasPermission: boolean;
    requestPermission: () => Promise<void>;
}

export function useLocation(): UseLocationReturn {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [hasPermission, setHasPermission] = useState(false);

    const requestPermission = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === 'granted');
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        } catch (error) {
            console.error('Error requesting location permission:', error);
        }
    };

    useEffect(() => {
        requestPermission();
    }, []);

    return { userLocation, hasPermission, requestPermission };
}
