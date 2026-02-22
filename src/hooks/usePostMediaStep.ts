import { useState, useCallback, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Linking, Alert } from 'react-native';
import { LocalPhoto, usePostPropertyStore } from '../store/PostPropertyStore';
import { useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { compressImage, validateKycImage } from '../utils/imageUtils'; // Same rules applied loosely or just compression
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';

export interface PostMediaErrors {
    photos?: string;
    titre?: string;
    prix_mensuel?: string;
    garantie_exigee?: string;
}

export interface UsePostMediaStepReturn {
    photos: LocalPhoto[];
    titre: string;
    prix_mensuel: string;
    garantie_exigee: string;
    errors: PostMediaErrors;
    isStepValid: boolean;
    pickFromGallery: () => Promise<void>;
    takePhoto: () => Promise<void>;
    removePhoto: (id: string) => void;
    setMainPhoto: (id: string) => void;
    reorderPhotos: (from: number, to: number) => void;
    setTitre: (v: string) => void;
    setPrixMensuel: (v: string) => void;
    setGarantieExigee: (v: string) => void;
    goToNextStep: () => void;
}

export function usePostMediaStep(): UsePostMediaStepReturn {
    const { user } = useAuth();
    const router = useRouter();
    const {
        photos, titre, prix_mensuel, garantie_exigee,
        setPhotos, addPhoto, removePhoto, setMainPhoto, reorderPhotos,
        setTitre, setPrixMensuel, setGarantieExigee, updatePhoto
    } = usePostPropertyStore();

    const [errors, setErrors] = useState<PostMediaErrors>({});

    // Background upload func
    const uploadPhotoInBackground = async (photo: LocalPhoto) => {
        if (!user) return;
        updatePhoto(photo.id, { isUploading: true, uploadProgress: 10 });

        try {
            const tempName = `temp/${user.id}/${photo.id}.jpg`;
            updatePhoto(photo.id, { uploadProgress: 30 }); // Simulating progress steps lightly if not using native callbacks

            const compressedUri = await compressImage(photo.uri, 1200, 0.8);
            const base64 = await fetch(compressedUri).then(r => r.blob()).then(blob => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            });

            updatePhoto(photo.id, { uploadProgress: 80 });

            const { data, error } = await supabase.storage
                .from('property-photos')
                .upload(tempName, decode(base64), { contentType: 'image/jpeg', upsert: true });

            if (error) throw error;

            updatePhoto(photo.id, {
                isUploading: false,
                uploadedUrl: data.path, // We store the internal path here
                uploadProgress: 100,
                uploadError: undefined
            });

        } catch (error: any) {
            updatePhoto(photo.id, { isUploading: false, uploadError: error.message });
        }
    };

    const handleNewAsset = (uri: string) => {
        if (photos.length >= 8) {
            Alert.alert("Limite atteinte", "Vous ne pouvez pas ajouter plus de 8 photos.");
            return;
        }
        const newPhoto: LocalPhoto = {
            id: Math.random().toString(36).substring(7),
            uri,
            isMain: photos.length === 0,
            isUploading: false // will be set inside
        };
        addPhoto(newPhoto);
        uploadPhotoInBackground(newPhoto);
    };

    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie.', [{ text: 'OK' }]);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.9,
            // allowsMultipleSelection: true // If expo supports it
        });

        if (!result.canceled && result.assets) {
            // For simple implementation we loop or take first depending on SDK
            result.assets.slice(0, 8 - photos.length).forEach(a => handleNewAsset(a.uri));
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la caméra.', [{ text: 'OK' }]);
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.9,
        });

        if (!result.canceled && result.assets) {
            handleNewAsset(result.assets[0].uri);
        }
    };

    // Validation
    const validate = () => {
        const newErrors: PostMediaErrors = {};

        if (photos.length < 3) newErrors.photos = "Ajoutez au moins 3 photos pour rendre votre annonce attractive";
        if (titre.length < 10 || titre.length > 80) newErrors.titre = "Le titre doit faire entre 10 et 80 caractères";

        const numPrice = parseInt(prix_mensuel, 10);
        if (isNaN(numPrice) || numPrice < 10000 || numPrice > 2000000) newErrors.prix_mensuel = "Prix invalide. Le loyer minimum est de 10 000 RWF";

        const numGarantie = parseInt(garantie_exigee, 10);
        if (isNaN(numGarantie) || numGarantie < 0 || numGarantie > 6) newErrors.garantie_exigee = "La garantie doit être entre 0 et 6 mois";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // We can debounce validation if we want, but for now we validate on changes lightly or mostly on submit
    useEffect(() => {
        // Just clear specific errors on change to improve UX, full check done below
    }, [photos, titre, prix_mensuel, garantie_exigee]);

    const isStepValid = photos.length >= 3 && titre.length >= 10 && parseInt(prix_mensuel || '0', 10) >= 10000;

    const goToNextStep = () => {
        const valid = validate();
        if (valid) {
            router.push('/(app)/post/location'); // Assuming part 2 is named location or similar
        }
    };

    return {
        photos, titre, prix_mensuel, garantie_exigee,
        errors, isStepValid,
        pickFromGallery, takePhoto, removePhoto, setMainPhoto, reorderPhotos,
        setTitre, setPrixMensuel, setGarantieExigee,
        goToNextStep
    };
}
