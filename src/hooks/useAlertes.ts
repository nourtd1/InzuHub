import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from '../store/ToastContext';
import { AlerteAvecQuartier } from '../types/database.types';
import { alerteService, CreateAlerteData } from '../services/alerteService';
import { useTranslation } from '../i18n/useTranslation';

export const useAlertes = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const [alertes, setAlertes] = useState<AlerteAvecQuartier[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await alerteService.fetchAlertes(user.id);
            setAlertes(data || []);
        } catch (error) {
            console.error('Erreur fetch alertes:', error);
            showToast({ message: t('common.error'), type: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [user, showToast, t]);

    const createAlerte = async (data: CreateAlerteData) => {
        if (!user) return;
        setIsCreating(true);
        try {
            await alerteService.createAlerte(user.id, data);

            // Check existing and potentially show double toast if necessary
            const matches = await alerteService.findMatchingProperties(data);
            if (matches.length > 0) {
                showToast({
                    message: matches.length > 1 ? t('alerts.existing_matches_plural', { count: matches.length }) : t('alerts.existing_matches', { count: matches.length }),
                    type: 'info'
                });
            } else {
                showToast({ message: t('alerts.created_toast'), type: 'success' });
            }

            await refresh();
        } catch (error: any) {
            console.error('Erreur create alerte:', error);
            let errMsg = t('common.error');
            if (error.message?.includes('Limite de 5 alertes')) {
                errMsg = t('alerts.limit_reached');
            }
            showToast({ message: errMsg, type: 'error' });
            throw error;
        } finally {
            setIsCreating(false);
        }
    };

    const updateAlerte = async (id: string, data: Partial<CreateAlerteData>) => {
        setIsCreating(true);
        try {
            await alerteService.updateAlerte(id, data);
            showToast({ message: t('alerts.updated_toast'), type: 'success' });
            await refresh();
        } catch (error) {
            console.error('Erreur update alerte:', error);
            showToast({ message: t('common.error'), type: 'error' });
            throw error;
        } finally {
            setIsCreating(false);
        }
    };

    const toggleAlerte = async (id: string, active: boolean) => {
        try {
            // Optimistic update
            setAlertes(prev => prev.map(a => a.id_alerte === id ? { ...a, est_active: active } : a));
            await alerteService.toggleAlerte(id, active);
            showToast({ message: active ? t('alerts.toggle_on') : t('alerts.toggle_off'), type: 'success' });
        } catch (error) {
            console.error('Erreur toggle alerte:', error);
            showToast({ message: t('common.error'), type: 'error' });
            await refresh(); // revert
        }
    };

    const deleteAlerte = async (id: string) => {
        try {
            // Optimistic deletion
            setAlertes(prev => prev.filter(a => a.id_alerte !== id));
            await alerteService.deleteAlerte(id);
            showToast({ message: t('alerts.deleted_toast'), type: 'success' });
        } catch (error) {
            console.error('Erreur delete alerte:', error);
            showToast({ message: t('common.error'), type: 'error' });
            await refresh(); // revert
        }
    };

    return {
        alertes,
        isLoading,
        isCreating,
        createAlerte,
        updateAlerte,
        toggleAlerte,
        deleteAlerte,
        refresh
    };
};
