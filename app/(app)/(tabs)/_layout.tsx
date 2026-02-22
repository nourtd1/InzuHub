import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme, { COLORS } from '../../../src/constants/theme';
import { useUnread } from '../../../src/store/UnreadContext';

export default function TabLayout() {
    const { totalUnread } = useUnread();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.textSecondary,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Theme.colors.surface,
                    borderTopColor: Theme.colors.border,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Accueil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Carte',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Messages',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubble-ellipses" size={24} color={color} />
                    ),
                    tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
                    tabBarBadgeStyle: {
                        backgroundColor: COLORS.danger,
                        color: '#FFFFFF',
                        fontSize: 10,
                    },
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
