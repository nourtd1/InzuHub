import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFavorisInternal } from '../hooks/useFavoris';
import { supabase } from '../lib/supabase';
import { Propriete } from '../types/database.types';
import * as Notifications from 'expo-notifications';
import { useTranslation } from '../i18n/useTranslation';
import { useToast } from './ToastContext';

type UseFavorisReturn = ReturnType<typeof useFavorisInternal>;

const FavorisContext = createContext<UseFavorisReturn>({} as UseFavorisReturn);

export const useFavoris = () => useContext(FavorisContext);

export const FavorisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const favorisData = useFavorisInternal(isAuthenticated && user ? user.id : undefined);
    const { t } = useTranslation();
    const { showToast } = useToast();

    // Listen for realtime status changes on favorite properties
    useEffect(() => {
        if (!isAuthenticated || !user?.id || favorisData.favorisIds.size === 0) return;

        const channel = supabase
            .channel('favoris-status')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'proprietes',
                },
                async (payload) => {
                    const updated = payload.new as Propriete;

                    if (favorisData.favorisIds.has(updated.id_propriete)) {
                        if (updated.statut === 'loue') {
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: t('favorites.status_change_title'),
                                    body: t('favorites.status_rented_body', { titre: updated.titre }),
                                },
                                trigger: null,
                            });
                            showToast({
                                message: t('favorites.status_rented_toast', { titre: updated.titre }),
                                type: 'warning'
                            });
                        } else if (updated.statut === 'disponible') {
                            await Notifications.scheduleNotificationAsync({
                                content: {
                                    title: t('favorites.available_again_title'),
                                    body: t('favorites.available_again_body', { titre: updated.titre }),
                                },
                                trigger: null,
                            });
                        }

                        // Refresh local favoris info
                        favorisData.refreshFavoris();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isAuthenticated, user?.id, favorisData.favorisIds, t, showToast]);

    return (
        <FavorisContext.Provider value={favorisData}>
            {children}
        </FavorisContext.Provider>
    );
};
