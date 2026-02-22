
import { Redirect, Stack } from 'expo-router';
import Theme from '../../src/constants/theme';
import { useAuth } from '../../src/hooks/useAuth';

export default function AppLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (!isAuthenticated && !isLoading) {
        return <Redirect href="/(auth)/login" />;
    }

    return (
        <Stack screenOptions={{
            headerStyle: {
                backgroundColor: Theme.colors.surface,
            },
            headerTintColor: Theme.colors.textPrimary,
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            contentStyle: {
                backgroundColor: Theme.colors.background,
            },
            animation: 'none'
        }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="property/[id]" options={{ presentation: 'modal', title: 'Détails' }} />
            <Stack.Screen name="visite/[id]" options={{ presentation: 'modal', title: 'Visite', headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ title: 'Discussion' }} />
            <Stack.Screen name="post/media" options={{ title: 'Nouvelle Annonce' }} />
            <Stack.Screen name="post/location" options={{ title: 'Localisation' }} />
        </Stack>
    );
}
