import { supabase } from '../lib/supabase';
import { compressImage, uriToBase64 } from '../utils/imageUtils';
import { decode } from 'base64-arraybuffer';

export const photoUploadService = {
    // Upload une photo temporaire
    async uploadTempPhoto(userId: string, imageUri: string): Promise<string> {
        // 1. Compresser
        const compressedUri = await compressImage(imageUri, 1200, 0.8);

        // 2. Préparer l'upload
        const base64 = await uriToBase64(compressedUri);
        // uuid temporaire pour le nom du fichier
        const tempName = `temp/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

        const { data, error } = await supabase.storage
            .from('property-photos')
            .upload(tempName, decode(base64), { contentType: 'image/jpeg' });

        if (error) {
            console.error("Upload temp photo error", error);
            throw new Error(`Erreur lors de l'upload: ${error.message}`);
        }

        // On retourne le path interne de Storage
        return data.path;
    },

    // Déplacer les photos temp vers le dossier final
    async moveTempPhotosToProperty(userId: string, propertyId: string, tempPaths: string[]): Promise<string[]> {
        const finalUrls: string[] = [];
        console.log(`Starting Move: ${tempPaths.length} photos for property ${propertyId}`);

        for (const tempPath of tempPaths) {
            try {
                // Ensure the path is relative to the bucket and doesn't contain the bucket name prefix
                let cleanSource = tempPath;
                if (cleanSource.startsWith('property-photos/')) {
                    cleanSource = cleanSource.substring('property-photos/'.length);
                }

                const fileName = cleanSource.split('/').pop();
                const finalPath = `${propertyId}/${fileName}`;

                console.log(`Attempting Move: '${cleanSource}' -> '${finalPath}'`);

                // Move operation
                const { error } = await supabase.storage
                    .from('property-photos')
                    .move(cleanSource, finalPath);

                if (error) {
                    if (error.message.includes('already exists')) {
                        console.log(`Photo already moved/exists at ${finalPath}`);
                    } else {
                        console.error(`Move failed for ${cleanSource}: ${error.message} (Status: ${error.name})`);
                        continue;
                    }
                }

                // URL Public Generation
                const { data: { publicUrl } } = supabase.storage
                    .from('property-photos')
                    .getPublicUrl(finalPath);

                finalUrls.push(publicUrl);
            } catch (err) {
                console.error(`Exception moving ${tempPath}:`, err);
                continue;
            }
        }

        console.log(`Move completed: ${finalUrls.length} photos successfully processed.`);
        return finalUrls;
    },

    // Supprimer les photos temp
    async cleanupTempPhotos(tempPaths: string[]): Promise<void> {
        if (!tempPaths.length) return;

        const { error } = await supabase.storage
            .from('property-photos')
            .remove(tempPaths);

        if (error) {
            console.error('Erreur nettoyage photos temp', error);
        }
    }
};
