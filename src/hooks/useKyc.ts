import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';
import { KycDemande } from '../types/database.types';
import { kycService } from '../services/kycService';

export type KycStep = 'intro' | 'recto' | 'verso' | 'selfie' | 'review' | 'submitted';

export interface UseKycReturn {
    kycDemande: KycDemande | null;
    isLoading: boolean;
    currentStep: KycStep;
    setStep: (step: KycStep) => void;
    photoRecto: string | null;
    photoVerso: string | null;
    photoSelfie: string | null;
    setPhotoRecto: (uri: string | null) => void;
    setPhotoVerso: (uri: string | null) => void;
    setPhotoSelfie: (uri: string | null) => void;
    retakeRecto: () => void;
    retakeVerso: () => void;
    retakeSelfie: () => void;
    isSubmitting: boolean;
    submitKyc: () => Promise<void>;
    canSubmit: boolean;
}

export function useKyc(): UseKycReturn {
    const { user } = useAuth();
    const [kycDemande, setKycDemande] = useState<KycDemande | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setStep] = useState<KycStep>('intro');

    // Captured images URIs
    const [photoRecto, setPhotoRecto] = useState<string | null>(null);
    const [photoVerso, setPhotoVerso] = useState<string | null>(null);
    const [photoSelfie, setPhotoSelfie] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadDemande = async () => {
            if (!user) return;
            try {
                const demande = await kycService.fetchKycDemande(user.id);
                setKycDemande(demande);
            } catch (error) {
                console.error("Erreur chargement KYC", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDemande();
    }, [user]);

    const submitKyc = async () => {
        if (!user || !photoRecto || !photoVerso || !photoSelfie) return;
        setIsSubmitting(true);
        try {
            // Upload to storage sequentially
            const urlRecto = await kycService.uploadKycPhoto(user.id, photoRecto, 'recto');
            const urlVerso = await kycService.uploadKycPhoto(user.id, photoVerso, 'verso');
            const urlSelfie = await kycService.uploadKycPhoto(user.id, photoSelfie, 'selfie');

            // Save row
            await kycService.submitKycDemande(user.id, {
                url_recto: urlRecto,
                url_verso: urlVerso,
                url_selfie: urlSelfie,
            });

            setStep('submitted');

            // Refresh local state without waiting too much
            const demande = await kycService.fetchKycDemande(user.id);
            setKycDemande(demande);

        } catch (error: any) {
            Alert.alert("Erreur", "L'envoi a échoué. " + (error.message || "Veuillez réessayer."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = Boolean(photoRecto && photoVerso && photoSelfie);

    return {
        kycDemande,
        isLoading,
        currentStep,
        setStep,
        photoRecto,
        photoVerso,
        photoSelfie,
        setPhotoRecto,
        setPhotoVerso,
        setPhotoSelfie,
        retakeRecto: () => setPhotoRecto(null),
        retakeVerso: () => setPhotoVerso(null),
        retakeSelfie: () => setPhotoSelfie(null),
        isSubmitting,
        submitKyc,
        canSubmit
    };
}
