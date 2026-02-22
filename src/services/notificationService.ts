import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import { VisiteComplete } from '../types/database.types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const notificationService = {
    async requestNotificationPermission(): Promise<boolean> {
        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return false;
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return false;
        }
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
        return true;
    },

    async getExpoPushToken(): Promise<string | null> {
        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                console.warn("No EAS project ID found. Skipping push token generation.");
                return null;
            }
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            return token;
        } catch (error) {
            console.error("Error getting matching push token", error);
            return null;
        }
    },

    async savePushToken(userId: string, token: string): Promise<void> {
        try {
            await supabase.from('notification_tokens').upsert({
                id_utilisateur: userId,
                token: token,
                platform: Platform.OS === 'ios' ? 'ios' : 'android'
            }, { onConflict: 'id_utilisateur' });

            // Apparemment tu voulais aussi upate utilisateurs
            await supabase.from('utilisateurs').update({
                push_token: token
            }).eq('id_utilisateur', userId);
        } catch (error) {
            console.error(error);
        }
    },

    async sendPushNotification(expoPushToken: string, title: string, body: string, data?: Record<string, string>) {
        const message = {
            to: expoPushToken,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
    },

    async scheduleVisiteReminder(visite: VisiteComplete): Promise<void> {
        const titlePropriete = visite.conversation?.propriete?.titre || 'une propriété';
        const rawDate = new Date(visite.date_visite);
        const date24hBefore = new Date(rawDate.getTime() - 24 * 60 * 60 * 1000);
        const date2hBefore = new Date(rawDate.getTime() - 2 * 60 * 60 * 1000);
        const heureStr = `${rawDate.getHours().toString().padStart(2, '0')}:${rawDate.getMinutes().toString().padStart(2, '0')}`;
        const quartierStr = visite.conversation?.propriete?.quartier?.nom_quartier || 'Gisenyi';

        let notifs = [];

        // 1. 24h avant
        if (date24hBefore > new Date()) {
            const id1 = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "📅 Rappel de visite demain !",
                    body: `Votre visite pour ${titlePropriete} est demain à ${heureStr}. Êtes-vous prêt ?`,
                    data: { visiteId: visite.id_visite },
                },
                trigger: { date: date24hBefore },
            });
            notifs.push(id1);
        }

        // 2. 2h avant
        if (date2hBefore > new Date()) {
            const id2 = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "⏰ Votre visite commence dans 2h",
                    body: `N'oubliez pas votre visite pour ${titlePropriete} à ${heureStr} !`,
                    data: { visiteId: visite.id_visite },
                },
                trigger: { date: date2hBefore },
            });
            notifs.push(id2);
        }

        // 3. Jour J
        if (rawDate > new Date()) {
            const id3 = await Notifications.scheduleNotificationAsync({
                content: {
                    title: "🏠 C'est l'heure de votre visite !",
                    body: `Rendez-vous maintenant pour ${titlePropriete} à ${quartierStr}`,
                    data: { visiteId: visite.id_visite },
                },
                trigger: { date: rawDate },
            });
            notifs.push(id3);
        }

        await AsyncStorage.setItem(`visite_reminders_${visite.id_visite}`, JSON.stringify(notifs));
    },

    async cancelVisiteReminders(visiteId: string): Promise<void> {
        try {
            const savedNotifs = await AsyncStorage.getItem(`visite_reminders_${visiteId}`);
            if (savedNotifs) {
                const notifs: string[] = JSON.parse(savedNotifs);
                for (const id of notifs) {
                    await Notifications.cancelScheduledNotificationAsync(id);
                }
                await AsyncStorage.removeItem(`visite_reminders_${visiteId}`);
            }
        } catch (e) {
            console.error("Error cancelling reminders", e);
        }
    }
};
