
import { supabase } from '../lib/supabase';
import { Utilisateur } from '../types/database.types';

export interface SignUpData {
    nom_complet: string;
    numero_telephone: string;
    mot_de_passe: string;
    role: 'locataire' | 'proprietaire';
}

export interface SignInData {
    numero_telephone: string;
    mot_de_passe: string;
}

export interface AuthResponse {
    data: any;
    error: string | null;
}

const authService = {
    // Formater le numéro en email fictif
    phoneToEmail(phone: string): string {
        // Garder uniquement les chiffres
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        return `${cleanPhone}@inzuhub.rw`;
    },

    // Créer le compte Supabase Auth
    async createAccount(data: SignUpData): Promise<AuthResponse> {
        try {
            const email = this.phoneToEmail(data.numero_telephone);

            const { data: authData, error } = await supabase.auth.signUp({
                email,
                password: data.mot_de_passe,
                options: {
                    data: {
                        nom_complet: data.nom_complet,
                        numero_telephone: data.numero_telephone,
                        role: data.role,
                    },
                },
            });

            if (error) {
                console.error('Supabase SignUp Error:', error);
                return { data: null, error: error.message };
            }

            return { data: authData, error: null };
        } catch (err: any) {
            return { data: null, error: err.message || 'Erreur inattendue' };
        }
    },

    // Connecter l'utilisateur
    async loginWithPhone(data: SignInData): Promise<AuthResponse> {
        try {
            const email = this.phoneToEmail(data.numero_telephone);

            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email,
                password: data.mot_de_passe,
            });

            if (error) {
                return { data: null, error: error.message };
            }

            return { data: authData, error: null };
        } catch (err: any) {
            return { data: null, error: err.message || 'Erreur inattendue' };
        }
    },

    // Récupérer le profil depuis la table utilisateurs
    async fetchProfile(userId: string): Promise<Utilisateur | null> {
        try {
            const { data, error } = await supabase
                .from('utilisateurs')
                .select('*')
                .eq('id_utilisateur', userId)
                .single();

            if (error) {
                console.error('Erreur fetchProfile:', error);
                return null;
            }

            return data;
        } catch (err) {
            console.error('Erreur fetchProfile:', err);
            return null;
        }
    },

    // Déconnexion
    async logout(): Promise<void> {
        await supabase.auth.signOut();
    },
};

export default authService;
