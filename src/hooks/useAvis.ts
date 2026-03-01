import { useState, useCallback } from 'react';
import { avisService, CreateAvisData } from '../services/avisService';
import { Avis, AvisComplet, StatsProprietaire } from '../types/database.types';

export interface UseAvisReturn {
    avis: AvisComplet[];
    stats: StatsProprietaire | null;
    isLoading: boolean;
    isSubmitting: boolean;
    myAvis: Avis | null;
    canReview: boolean;
    submitAvis: (data: CreateAvisData) => Promise<void>;
    deleteMyAvis: (avisId: string) => Promise<void>;
    refreshOwnerAvis: (proprietaireId: string) => Promise<void>;
    checkReviewEligibility: (userId: string, visiteId: string) => Promise<void>;
}

export function useAvis(): UseAvisReturn {
    const [avis, setAvis] = useState<AvisComplet[]>([]);
    const [stats, setStats] = useState<StatsProprietaire | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myAvis, setMyAvis] = useState<Avis | null>(null);
    const [canReview, setCanReview] = useState(false);

    const refreshOwnerAvis = useCallback(async (proprietaireId: string) => {
        setIsLoading(true);
        try {
            const [fetchedAvis, fetchedStats] = await Promise.all([
                avisService.fetchAvisProprietaire(proprietaireId),
                avisService.fetchStatsProprietaire(proprietaireId),
            ]);
            setAvis(fetchedAvis);
            setStats(fetchedStats);
        } catch (error) {
            console.error('Error fetching owner avis:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkReviewEligibility = useCallback(async (userId: string, visiteId: string) => {
        try {
            const eligibility = await avisService.canLeaveAvis(userId, visiteId);
            setCanReview(eligibility);
            if (!eligibility) {
                // Check if they already reviewed
                const existing = await avisService.getMyAvis(userId, visiteId);
                setMyAvis(existing);
            } else {
                setMyAvis(null);
            }
        } catch (error) {
            console.error('Error checking review eligibility:', error);
            setCanReview(false);
        }
    }, []);

    const submitAvis = async (data: CreateAvisData) => {
        setIsSubmitting(true);
        try {
            const newAvis = await avisService.createAvis(data);
            setMyAvis(newAvis);
            setCanReview(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteMyAvis = async (avisId: string) => {
        try {
            await avisService.deleteAvis(avisId);
            setMyAvis(null);
        } catch (error) {
            console.error('Error deleting avis:', error);
            throw error;
        }
    };

    return {
        avis,
        stats,
        isLoading,
        isSubmitting,
        myAvis,
        canReview,
        submitAvis,
        deleteMyAvis,
        refreshOwnerAvis,
        checkReviewEligibility
    };
}
