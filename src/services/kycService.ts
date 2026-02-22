import { supabase } from '../lib/supabase';
import { KycDemande } from '../types/database.types';
import { compressImage, validateKycImage, uriToBase64 } from '../utils/imageUtils';
import { decode } from 'base64-arraybuffer';

export interface KycSubmitData {
    url_recto: string;
    url_verso: string;
    url_selfie: string;
}

export const kycService = {
    async fetchKycDemande(userId: string): Promise<KycDemande | null> {
        const { data, error } = await supabase
            .from('kyc_demandes')
            .select('*')
            .eq('id_utilisateur', userId)
            .maybeSingle();

        if (error) {
            console.error("Erreur fetchKycDemande", error);
            return null;
        }
        return data as unknown as KycDemande;
    },

    async hasPendingDemande(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('kyc_demandes')
            .select('id_demande')
            .eq('id_utilisateur', userId)
            .maybeSingle();

        return !!data && !error;
    },

    async submitKycDemande(userId: string, data: KycSubmitData): Promise<KycDemande> {
        const hasPending = await this.hasPendingDemande(userId);
        if (hasPending) {
            // Delete existing rejected demande (or pending, but usually you don't submit over pending)
            // But we can delete the old record since unique constraint is there.
            await supabase.from('kyc_demandes').delete().eq('id_utilisateur', userId);
        }

        const { data: result, error } = await supabase
            .from('kyc_demandes')
            .insert({
                id_utilisateur: userId,
                url_recto: data.url_recto,
                url_verso: data.url_verso,
                url_selfie: data.url_selfie,
                statut: 'en_attente'
            } as any)
            .select()
            .single();

        if (error) throw error;

        // Trigger webhook or edge function 'notify-kyc-admin'
        try {
            await supabase.functions.invoke('notify-kyc-admin', { body: { userId, demandeId: result.id_demande } });
        } catch (e) {
            console.log("Edge function notify-kyc-admin failed or not implemented yet", e);
        }

        return result as unknown as KycDemande;
    },

    async uploadKycPhoto(userId: string, imageUri: string, type: 'recto' | 'verso' | 'selfie'): Promise<string> {
        // 1. Validate
        const validRes = await validateKycImage(imageUri);
        if (!validRes.valid) throw new Error(validRes.error);

        // 2. Compress
        const compressedUri = await compressImage(imageUri);

        // 3. Upload
        const base64 = await uriToBase64(compressedUri);
        const fileName = `${userId}/${type}_${Date.now()}.jpg`;

        const { data, error } = await supabase.storage
            .from('kyc-documents')
            .upload(fileName, decode(base64), { contentType: 'image/jpeg' });

        if (error) throw error;

        return data.path; // Return internal path, bucket is private
    }
};
