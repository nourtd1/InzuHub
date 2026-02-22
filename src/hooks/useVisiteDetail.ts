import { useState, useEffect } from 'react';
import { Share, Alert, Linking, Platform } from 'react-native';
import { VisiteComplete } from '../types/database.types';
import { visiteService } from '../services/visiteService';
import { notificationService } from '../services/notificationService';
import { messageService } from '../services/messageService';
import { useAuth } from './useAuth';
import { differenceInDays, differenceInHours, differenceInMinutes, isToday, isFuture, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatDateVisite, formatTelephone } from '../utils/formatters';
import { router } from 'expo-router';

export function useVisiteDetail(visiteId: string) {
    const { user } = useAuth();
    const [visite, setVisite] = useState<VisiteComplete | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [timeUntilVisite, setTimeUntilVisite] = useState<string | null>(null);

    const loadVisite = async () => {
        setIsLoading(true);
        const data = await visiteService.getVisiteComplete(visiteId);
        setVisite(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (visiteId) loadVisite();
    }, [visiteId]);

    useEffect(() => {
        if (!visite || visite.statut !== 'confirmee') {
            setTimeUntilVisite(null);
            return;
        }

        const dateVisite = new Date(visite.date_visite);

        const updateCountdown = () => {
            if (!isFuture(dateVisite)) {
                setTimeUntilVisite(null);
                return;
            }
            const now = new Date();
            const days = differenceInDays(dateVisite, now);
            const hours = differenceInHours(dateVisite, now) % 24;
            const minutes = differenceInMinutes(dateVisite, now) % 60;

            if (isToday(dateVisite)) {
                setTimeUntilVisite(`🔴 C'est aujourd'hui ! Dans ${differenceInHours(dateVisite, now) > 0 ? differenceInHours(dateVisite, now) + 'h' : minutes + 'm'}`);
            } else {
                setTimeUntilVisite(`Dans ${days} jours et ${hours} heures`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);
        return () => clearInterval(interval);
    }, [visite]);

    const isCurrentUserLocataire = user?.id === visite?.conversation?.id_locataire;
    const isCurrentUserProprietaire = user?.id === visite?.conversation?.id_proprietaire;
    const isVisiteFuture = visite ? isFuture(new Date(visite.date_visite)) : false;
    const isVisiteAujourdhui = visite ? isToday(new Date(visite.date_visite)) : false;

    const confirmerVisite = async () => {
        if (!visite) return;
        setIsConfirming(true);
        try {
            await visiteService.confirmerVisite(visite.id_visite);
            await loadVisite();
            // Lancer les notifications asynchrones
            const freshVisite = await visiteService.getVisiteComplete(visite.id_visite);
            if (freshVisite) {
                await notificationService.scheduleVisiteReminder(freshVisite);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsConfirming(false);
        }
    };

    const annulerVisite = async () => {
        if (!visite || !user) return;

        Alert.alert(
            "Annuler la visite ?",
            `Êtes-vous sûr de vouloir annuler la visite du ${format(new Date(visite.date_visite), "d MMM 'à' HH:mm", { locale: fr })} ?\nL'autre partie sera informée.`,
            [
                { text: 'Garder la visite', style: 'cancel' },
                {
                    text: 'Oui, annuler',
                    style: 'destructive',
                    onPress: async () => {
                        setIsCancelling(true);
                        try {
                            await visiteService.annulerVisite(visite.id_visite);
                            await notificationService.cancelVisiteReminders(visite.id_visite);

                            const dateStr = format(new Date(visite.date_visite), 'd MMM yyyy', { locale: fr });
                            await messageService.sendMessage(
                                visite.id_conversation,
                                user.id,
                                `❌ ${user.user_metadata?.nom_complet || user.email} a annulé la visite du ${dateStr}`,
                                'texte'
                            );

                            // Toast "Visite annulée."
                            Alert.alert('Succès', 'Visite annulée. Vous pouvez en proposer une nouvelle.');
                            await loadVisite();
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setIsCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    const addToCalendar = () => {
        if (!visite) return;
        const d = new Date(visite.date_visite);
        const calendarUrl = Platform.select({
            ios: `calshow:${d.getTime() / 1000}`,
            android: `content://com.android.calendar/events`
        });
        if (calendarUrl) Linking.openURL(calendarUrl);
    };

    const shareVisite = () => {
        if (!visite || !visite.conversation) return;
        const { propriete } = visite.conversation;
        const { proprietaire } = visite.conversation;

        const shareContent = `
🏠 Visite InzuHub

Logement : ${propriete.titre}
Quartier : ${propriete.quartier?.nom_quartier || 'Gisenyi'}, Gisenyi
Date : ${formatDateVisite(visite.date_visite)}

Propriétaire : ${proprietaire.nom_complet}
📞 ${formatTelephone(proprietaire.numero_telephone)}

Référence : #${visite.id_visite.slice(0, 8).toUpperCase()}
        `.trim();

        Share.share({
            message: shareContent,
            title: 'Détails de ma visite InzuHub'
        });
    };

    return {
        visite,
        isLoading,
        isCurrentUserLocataire,
        isCurrentUserProprietaire,
        isVisiteFuture,
        isVisiteAujourdhui,
        timeUntilVisite,
        isConfirming,
        isCancelling,
        confirmerVisite,
        annulerVisite,
        addToCalendar,
        shareVisite,
        refresh: loadVisite
    };
}
