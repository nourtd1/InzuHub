
import React, { createContext, useState, useEffect, PropsWithChildren } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import authService, { SignUpData, SignInData } from '../services/authService';
import { Utilisateur } from '../types/database.types';
import { getErrorMessage } from '../utils/errorMessages';

interface AuthContextType {
    user: User | null;
    profile: Utilisateur | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signUp: (data: SignUpData) => Promise<{ error: string | null }>;
    signIn: (data: SignInData) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Utilisateur | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const forceLocalSignOut = async () => {
        try {
            await supabase.auth.signOut({ scope: 'local' });
        } catch {
            // ignore
        } finally {
            setSession(null);
            setUser(null);
            setProfile(null);
        }
    };

    useEffect(() => {
        if (__DEV__) console.log("AuthContext: Starting initial session check...");
        // 1. Check active session on mount
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (__DEV__) console.log("AuthContext: getSession finished. Error?", error, "Session?", !!session);
            if (error) {
                if ((error as any)?.message?.toLowerCase?.().includes('invalid refresh token')) {
                    forceLocalSignOut();
                    return;
                }
                console.error("Erreur gession de session:", error);
            }
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                if (__DEV__) console.log("AuthContext: fetching profile for user", session.user.id);
                authService.fetchProfile(session.user.id).then(prof => {
                    if (__DEV__) console.log("AuthContext: Profile fetched:", !!prof);
                    setProfile(prof);
                });
            }
        }).catch((err) => {
            console.error("Session fetch failed completely:", err);
        }).finally(() => {
            if (__DEV__) console.log("AuthContext: getSession finally block executing, setting isLoading false");
            setIsLoading(false);
        });

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (_event === 'TOKEN_REFRESH_FAILED') {
                await forceLocalSignOut();
                setIsLoading(false);
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const userProfile = await authService.fetchProfile(session.user.id);
                setProfile(userProfile);
            } else {
                setProfile(null);
            }

            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (data: SignUpData): Promise<{ error: string | null }> => {
        setIsLoading(true);
        const { error } = await authService.createAccount(data);

        if (error) {
            setIsLoading(false);
            return { error: getErrorMessage(error) };
        }

        // Note: If email confirmation is disabled in Supabase, the user will be signed in automatically
        // and onAuthStateChange will trigger.
        setIsLoading(false);
        return { error: null };
    };

    const signIn = async (data: SignInData): Promise<{ error: string | null }> => {
        setIsLoading(true);
        const { error } = await authService.loginWithPhone(data);

        if (error) {
            setIsLoading(false);
            return { error: getErrorMessage(error) };
        }

        // onAuthStateChange will handle the rest
        return { error: null };
    };

    const signOut = async () => {
        setIsLoading(true);
        await authService.logout();
        // onAuthStateChange will handle the rest
        setIsLoading(false);
    };

    const refreshProfile = async () => {
        if (user) {
            const userProfile = await authService.fetchProfile(user.id);
            setProfile(userProfile);
        }
    };

    const value: AuthContextType = {
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
