import 'react-native-reanimated';

import { Slot, SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../src/store/AuthContext';
import { UnreadProvider } from '../src/store/UnreadContext';
import { useAuth } from '../src/hooks/useAuth';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../src/constants/theme';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../src/services/notificationService';
import { supabase } from '../src/lib/supabase';
import { KycDemande } from '../src/types/database.types';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
    const { isAuthenticated, isLoading, user, refreshProfile } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (!process.env.EXPO_PUBLIC_SUPABASE_URL) return; // Prevent during some tests

        notificationService.requestNotificationPermission().then(granted => {
            if (granted && isAuthenticated && user) {
                notificationService.getExpoPushToken().then(token => {
                    if (token) {
                        notificationService.savePushToken(user.id, token);
                    }
                });
            }
        });

        const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
            const data = response.notification.request.content.data;
            if (data?.visiteId) {
                router.push(`/visite/${data.visiteId}`);
            }
            if (data?.conversationId) {
                router.push(`/chat/${data.conversationId}`);
            }
        });

        return () => subscription.remove();
    }, [isAuthenticated, user?.id]);

    useEffect(() => {
        if (!user?.id) return;

        const kycChannel = supabase
            .channel('kyc-status')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'kyc_demandes',
                filter: `id_utilisateur=eq.${user.id}`
            }, async (payload) => {
                const updated = payload.new as KycDemande;

                if (updated.statut === 'approuve') {
                    await refreshProfile();
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: '✅ Identité vérifiée !',
                            body: 'Votre compte InzuHub est maintenant certifié. Votre badge ✓ est visible sur vos annonces.',
                        },
                        trigger: null
                    });
                }

                if (updated.statut === 'rejete') {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: '❌ Vérification refusée',
                            body: `Motif : ${updated.motif_rejet}. Ouvrez InzuHub pour resoumettre.`,
                        },
                        trigger: null
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(kycChannel);
        }
    }, [user?.id, refreshProfile]);


    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <AuthProvider>
            <UnreadProvider>
                <RootLayoutNav />
            </UnreadProvider>
        </AuthProvider>
    );
}
