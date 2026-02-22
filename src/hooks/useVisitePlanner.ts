import { useState, useEffect } from 'react';
import { Visite } from '../types/database.types';
import { visiteService } from '../services/visiteService';
import { isSameDay } from 'date-fns';
import { genererCreneaux } from '../utils/formatters';

export function useVisitePlanner(conversationId: string, proprietaireId: string) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedHeure, setSelectedHeure] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [visiteActive, setVisiteActive] = useState<Visite | null>(null);
    const [creneauxDisponibles, setCreneauxDisponibles] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadVisiteActive = async () => {
            setIsLoading(true);
            const active = await visiteService.getVisiteActive(conversationId);
            setVisiteActive(active);
            setIsLoading(false);
        };
        loadVisiteActive();
    }, [conversationId]);

    useEffect(() => {
        const loadCreneaux = async () => {
            if (!selectedDate) {
                setCreneauxDisponibles([]);
                return;
            }

            const tousLesCreneaux = genererCreneaux();
            const dispos: string[] = [];

            for (const heure of tousLesCreneaux) {
                const [h, m] = heure.split(':').map(Number);
                const dateToCheck = new Date(selectedDate);
                dateToCheck.setHours(h, m, 0, 0);

                if (isSameDay(dateToCheck, new Date()) && dateToCheck < new Date()) {
                    continue;
                }

                const isDispo = await visiteService.isCreneauDisponible(proprietaireId, dateToCheck);
                if (isDispo) {
                    dispos.push(heure);
                }
            }

            setCreneauxDisponibles(dispos);
        };

        loadCreneaux();
    }, [selectedDate, proprietaireId]);

    const isCreneauValid = selectedDate !== null && selectedHeure !== null && creneauxDisponibles.includes(selectedHeure);

    const submitVisite = async () => {
        if (!isCreneauValid) return;
        setIsSubmitting(true);
        try {
            const [h, m] = selectedHeure.split(':').map(Number);
            const dateVisite = new Date(selectedDate);
            dateVisite.setHours(h, m, 0, 0);

            await visiteService.proposeVisite(conversationId, dateVisite);

            const active = await visiteService.getVisiteActive(conversationId);
            setVisiteActive(active);
        } catch (error) {
            console.error("Erreur proposeVisite", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const reset = () => {
        setSelectedDate(null);
        setSelectedHeure(null);
    };

    return {
        selectedDate,
        selectedHeure,
        isCreneauValid,
        isSubmitting,
        setSelectedDate,
        setSelectedHeure,
        submitVisite,
        reset,
        visiteActive,
        creneauxDisponibles,
        isLoading
    };
}
