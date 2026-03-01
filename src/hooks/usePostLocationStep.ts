import { useState, useEffect } from 'react';
import { usePostPropertyStore } from '../store/PostPropertyStore';
import { Quartier } from '../types/database.types';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { propertyService } from '../services/propertyService';
import { photoUploadService } from '../services/photoUploadService';
import * as Location from 'expo-location';
import { LatLng } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { getErrorMessage } from '../utils/errorMessages';
import { Alert } from 'react-native';

export interface PostLocationErrors {
    id_quartier?: string;
    description?: string;
    nombre_chambres?: string;
    nombre_salons?: string;
}

export interface UsePostLocationStepReturn {
    id_quartier: string;
    description: string;
    nombre_chambres: string;
    nombre_salons: string;
    has_eau: boolean;
    has_electricite: boolean;
    has_cloture: boolean;
    has_parking: boolean;
    latitude: number | null;
    longitude: number | null;

    quartiers: Quartier[];
    selectedQuartier: Quartier | null;

    errors: PostLocationErrors;
    isStepValid: boolean;

    isMapVisible: boolean;
    setIsMapVisible: (v: boolean) => void;
    onMapPress: (coord: LatLng) => void;
    onUseCurrentLocation: () => Promise<void>;

    setField: (key: any, value: any) => void;
    setQuartier: (id: string) => void;

    isPublishing: boolean;
    publishStep: number; // 0=idle, 1=info, 2=photos, 3=success
    publishError: string | null;
    publishAnnonce: () => Promise<void>;
    handleGoBack: () => void;
}

export function usePostLocationStep(): UsePostLocationStepReturn {
    const { user } = useAuth();
    const router = useRouter();
    const store = usePostPropertyStore();

    const [quartiers, setQuartiers] = useState<Quartier[]>([]);
    const [isMapVisible, setIsMapVisible] = useState(false);
    const [errors, setErrors] = useState<PostLocationErrors>({});
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStep, setPublishStep] = useState(0);
    const [publishError, setPublishError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuartiers = async () => {
            const { data } = await supabase.from('quartiers').select('*').order('nom_quartier');
            if (data) setQuartiers(data);
        };
        fetchQuartiers();
    }, []);

    const validate = () => {
        const newErrors: PostLocationErrors = {};
        if (!store.id_quartier) newErrors.id_quartier = "Veuillez sélectionner un quartier";

        if (store.description.length < 50 || store.description.length > 1000) {
            newErrors.description = "La description doit faire entre 50 et 1000 caractères";
        }

        const chambres = parseInt(store.nombre_chambres, 10);
        if (isNaN(chambres) || chambres < 1 || chambres > 20) {
            newErrors.nombre_chambres = "Le nombre de chambres doit être entre 1 et 20";
        }

        const salons = parseInt(store.nombre_salons, 10);
        if (isNaN(salons) || salons < 0 || salons > 10) {
            newErrors.nombre_salons = "Le nombre de salons doit être entre 0 et 10";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isStepValid = Boolean(
        store.id_quartier &&
        store.description.length >= 50 &&
        store.description.length <= 1000 &&
        parseInt(store.nombre_chambres, 10) >= 1 &&
        parseInt(store.nombre_salons, 10) >= 0
    );

    const onMapPress = (coord: LatLng) => {
        store.setField('latitude', coord.latitude);
        store.setField('longitude', coord.longitude);
    };

    const onUseCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission refusée', 'Activez la localisation dans les paramètres.');
            return;
        }

        const location = await Location.getCurrentPositionAsync({});
        store.setField('latitude', location.coords.latitude);
        store.setField('longitude', location.coords.longitude);
    };

    const publishAnnonce = async () => {
        if (!user || !validate()) return;

        // Check if all photos are finished uploading
        const pendingUploads = store.photos.some(p => p.isUploading);
        if (pendingUploads) {
            Alert.alert("Attente d'upload", "Certaines photos sont encore en cours d'envoi. Veuillez patienter quelques secondes.");
            return;
        }

        setIsPublishing(true);
        setPublishStep(1);
        setPublishError(null);

        try {
            console.log("Publishing: Step 1 (Creating property)...");
            // Etape 1 : Créer la propriété
            const property = await propertyService.createProperty({
                id_utilisateur: user.id,
                id_quartier: store.id_quartier,
                titre: store.titre,
                description: store.description,
                prix_mensuel: parseInt(store.prix_mensuel, 10),
                garantie_exigee: parseInt(store.garantie_exigee, 10),
                nombre_chambres: parseInt(store.nombre_chambres, 10),
                nombre_salons: parseInt(store.nombre_salons, 10),
                has_eau: store.has_eau,
                has_electricite: store.has_electricite,
                has_cloture: store.has_cloture,
                has_parking: store.has_parking,
                latitude: store.latitude,
                longitude: store.longitude,
                statut: 'disponible'
            });
            console.log("Property created:", property.id_propriete);

            // Etape 2 : Photos
            setPublishStep(2);
            const validPhotos = store.photos.filter(p => p.uploadedUrl);
            const sortedPhotos = validPhotos.sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1));

            const finalUrls = await photoUploadService.moveTempPhotosToProperty(
                user.id,
                property.id_propriete,
                sortedPhotos.map(p => p.uploadedUrl as string)
            );

            // Etape 3 : Insert Photos in Base
            if (finalUrls.length > 0) {
                const photosToInsert = finalUrls.map((url, index) => ({
                    id_propriete: property.id_propriete,
                    url_photo: url,
                    est_photo_principale: index === 0
                }));

                const { error: insertError } = await supabase.from('photos').insert(photosToInsert as any);
                if (insertError) throw insertError;
            }

            // SUCCESS
            setPublishStep(3);
            setTimeout(() => {
                store.reset();
                router.replace(`/(app)/property/${property.id_propriete}`);
            }, 2000);

        } catch (error: any) {
            setPublishStep(0);
            setIsPublishing(false);
            setPublishError(getErrorMessage(error));
        }
    };

    const handleGoBack = () => {
        Alert.alert(
            "Retourner à l'étape précédente ?",
            "Vos informations de cette étape seront conservées.",
            [
                { text: "Rester ici", style: "cancel" },
                { text: "Retour étape 1", onPress: () => router.back() }
            ]
        );
    };

    return {
        id_quartier: store.id_quartier,
        description: store.description,
        nombre_chambres: store.nombre_chambres,
        nombre_salons: store.nombre_salons,
        has_eau: store.has_eau,
        has_electricite: store.has_electricite,
        has_cloture: store.has_cloture,
        has_parking: store.has_parking,
        latitude: store.latitude,
        longitude: store.longitude,

        quartiers,
        selectedQuartier: quartiers.find(q => q.id_quartier === store.id_quartier) || null,

        errors,
        isStepValid,

        isMapVisible,
        setIsMapVisible,
        onMapPress,
        onUseCurrentLocation,

        setField: store.setField,
        setQuartier: (id) => store.setField('id_quartier', id),

        isPublishing,
        publishStep,
        publishError,
        publishAnnonce,
        handleGoBack
    };
}
