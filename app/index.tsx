import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../src/constants/theme';

export default function Index() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(app)/(tabs)" />;
    } else {
        return <Redirect href="/(auth)/login" />;
    }
}
