import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export async function compressImage(
    uri: string,
    maxWidth: number = 1200,
    quality: number = 0.8
): Promise<string> {
    // On ne compresse pas sur le Web de la même façon (ou on laisse tel quel pour le moment)
    if (Platform.OS === 'web') return uri;

    try {
        const manipResult = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: maxWidth } }],
            { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
        );
        return manipResult.uri;
    } catch (e) {
        console.error("Erreur compression", e);
        return uri;
    }
}

export async function validateKycImage(
    uri: string
): Promise<{ valid: boolean; error?: string }> {
    // Sur le Web, on saute la validation de taille car FileSystem n'y a pas accès directement
    if (Platform.OS === 'web') return { valid: true };

    try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
            return { valid: false, error: "L'image n'existe pas." };
        }

        // Taille minimale (100KB) pour éviter les photos floues
        if (fileInfo.size && fileInfo.size < 50 * 1024) {
            return { valid: false, error: "Image trop petite, elle pourrait être floue." };
        }

        // Taille maximale (15MB)
        if (fileInfo.size && fileInfo.size > 15 * 1024 * 1024) {
            return { valid: false, error: "Image trop grande (max 15MB)." };
        }

        return { valid: true };
    } catch (e) {
        console.error("Erreur validation image", e);
        // En cas d'erreur de lecture du système de fichier, on laisse passer pour ne pas bloquer l'utilisateur
        return { valid: true };
    }
}

export async function uriToBase64(uri: string): Promise<string> {
    if (Platform.OS === 'web') {
        // Sur le web, l'URI est parfois déjà un blob ou une URL. 
        // ImagePicker sur web retourne parfois un base64 ou une URL blob.
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result as string;
                resolve(base64data.split(',')[1]); // On retire le prefixe data:image/jpeg;base64,
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}
