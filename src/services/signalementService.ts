import { supabase } from '../lib/supabase';

export interface CreateSignalementData {
    id_propriete: string;
    motif: string;
}

export const signalementService = {
    /**
     * Create a new report (signalement)
     */
    async createSignalement(data: CreateSignalementData, userId: string): Promise<void> {
        const { error } = await supabase
            .from('signalements')
            .insert({
                id_utilisateur: userId,
                id_propriete: data.id_propriete,
                motif: data.motif,
            });

        if (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    },

    /**
     * Check if a user has already reported this property
     */
    async hasAlreadyReported(userId: string, propertyId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('signalements')
            .select('id_signalement')
            .eq('id_utilisateur', userId)
            .eq('id_propriete', propertyId)
            .limit(1);

        if (error) {
            console.error('Error checking report status:', error);
            return false;
        }

        return data && data.length > 0;
    }
};
