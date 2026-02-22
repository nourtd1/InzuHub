
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';

export default function AuthLayout() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isAuthenticated && !isLoading) {
        return <Redirect href="/(app)/(tabs)" />;
    }

    return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
