import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Utilisateur } from '../types/admin.types';
import { Session } from '@supabase/supabase-js';

type AuthState = {
    user: (Utilisateur & { est_admin: boolean }) | null;
    session: Session | null;
    isLoading: boolean;
};

const AuthContext = createContext<AuthState>({
    user: null,
    session: null,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<AuthState['user']>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Initial fetch
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setIsLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('utilisateurs')
                .select('*')
                .eq('id_utilisateur', userId)
                .single();

            if (error) throw error;

            // We assume est_admin property exists based on SQL request changes
            // @ts-ignore Since we didn't inject est_admin in the typescript definition of 'utilisateurs' yet
            if (data?.est_admin) {
                // @ts-ignore
                setUser(data);
            } else {
                setUser(null); // Force log out on the client side if not admin
                await supabase.auth.signOut();
            }
        } catch (error) {
            console.error('Error fetching admin profile', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
