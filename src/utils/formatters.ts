import { formatDistanceToNow, isToday, isYesterday, isThisWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate un montant en RWF avec séparateurs de milliers
 * @example 150000 -> "150 000 RWF"
 */
export function formatPrix(amount: number): string {
    return new Intl.NumberFormat('fr-RW', {
        style: 'currency',
        currency: 'RWF',
        maximumFractionDigits: 0,
    }).format(amount).replace('RF', 'RWF');
}

/**
 * Formate un montant mensuel
 * @example 150000 -> "150 000 RWF/mois"
 */
export function formatPrixMensuel(amount: number): string {
    return `${formatPrix(amount)}/mois`;
}

/**
 * Retourne une date relative en français
 * @example "Il y a 2 jours"
 */
export function formatDateRelative(date?: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
}

/**
 * Formate un numéro de téléphone pour l'affichage
 * @example "+250788123456" -> "+250 788 123 456"
 */
export function formatTelephone(phone: string): string {
    // Supposons un format standard Rwanda +250...
    // Nettoyer d'abord
    const cleaned = phone.replace(/\s/g, '');

    // Si format +250 7XX XXX XXX
    if (cleaned.startsWith('+250') && cleaned.length === 13) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)} ${cleaned.slice(10)}`;
    }

    // Si format 07XX XXX XXX
    if (cleaned.startsWith('07') && cleaned.length === 10) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }

    return phone;
}

/**
 * Formate un prix en version courte pour les cartes
 * @example 150000 -> "150K RWF"
 */
export function formatPrixCourt(amount: number): string {
    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace('.0', '')}M RWF`;
    }
    if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K RWF`;
    }
    return formatPrix(amount);
}

/**
 * Formats time for conversation items
 */
export function formatConversationTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    if (isToday(date)) {
        return format(date, 'HH:mm');
    }
    if (isYesterday(date)) {
        return 'Hier';
    }
    if (isThisWeek(date)) {
        // e.g., "Lun.", "Mar."
        return format(date, 'EEee', { locale: fr });
    }
    return format(date, 'dd/MM');
}

/**
 * Gets conversation period for grouping
 */
export function getConversationPeriod(dateString: string): 'today' | 'week' | 'older' {
    const date = new Date(dateString);
    if (isToday(date)) return 'today';
    if (isThisWeek(date) || isYesterday(date)) return 'week';
    return 'older';
}

/**
 * Label for the period text
 */
export function getPeriodLabel(period: 'today' | 'week' | 'older'): string {
    switch (period) {
        case 'today': return "Aujourd'hui";
        case 'week': return "Cette semaine";
        case 'older': return "Plus anciennes";
        default: return "Plus anciennes";
    }
}

// Date de visite longue
// "Lundi 15 janvier 2025 à 10h00"
export function formatDateVisite(date?: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr });
}

// Date courte pour les chips
// "Lun. 15 jan."
export function formatDateCourte(date?: string | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return format(d, "EEE d MMM", { locale: fr });
}

// Heure formatée
// "10:00" → "10h00"
export function formatHeure(heure: string): string {
    return heure.replace(':', 'h');
}

// Générer les 30 prochains jours (sauf aujourd'hui)
export function getProchains30Jours(): Date[] {
    const jours: Date[] = [];
    const demain = new Date();
    demain.setDate(demain.getDate() + 1);
    demain.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
        const d = new Date(demain);
        d.setDate(d.getDate() + i);
        jours.push(d);
    }
    return jours;
}

// Générer les créneaux de 08h00 à 18h00 par 30min
export function genererCreneaux(): string[] {
    const creneaux: string[] = [];
    for (let h = 8; h <= 18; h++) {
        const hh = h.toString().padStart(2, '0');
        creneaux.push(`${hh}:00`);
        if (h !== 18) creneaux.push(`${hh}:30`);
    }
    return creneaux;
}
