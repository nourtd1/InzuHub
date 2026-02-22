
import { Stack } from 'expo-router';
import Theme from '../../src/constants/theme';

export default function AppLayout() {
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
            }
        }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="property/[id]" options={{ presentation: 'modal', title: 'Détails' }} />
            <Stack.Screen name="chat/[id]" options={{ title: 'Discussion' }} />
            <Stack.Screen name="post/media" options={{ title: 'Nouvelle Annonce' }} />
            <Stack.Screen name="post/location" options={{ title: 'Localisation' }} />
        </Stack>
    );
}
