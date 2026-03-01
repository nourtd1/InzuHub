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

        for (const tempPath of tempPaths) {
            try {
                // Vérifier si le fichier existe avant de le déplacer
                const { data: existingFile, error: checkError } = await supabase.storage
                    .from('property-photos')
                    .list(tempPath.substring(0, tempPath.lastIndexOf('/')), {
                        search: tempPath.split('/').pop()
                    });

                if (checkError || !existingFile || existingFile.length === 0) {
                    console.warn(`Photo temp introuvable, ignorée: ${tempPath}`);
                    continue;
                }

                const fileName = tempPath.split('/').pop();
                const finalPath = `${propertyId}/${fileName}`;

                const { data, error } = await supabase.storage
                    .from('property-photos')
                    .move(tempPath, finalPath);

                if (error) {
                    console.error(`Erreur déplacement photo ${tempPath} vers ${finalPath}`, error);
                    continue;
                }

                // Récupérer l'URL publique
                const { data: { publicUrl } } = supabase.storage
                    .from('property-photos')
                    .getPublicUrl(finalPath);

                finalUrls.push(publicUrl);
            } catch (err) {
                console.error(`Exception lors du déplacement de ${tempPath}:`, err);
                continue;
            }
        }

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
