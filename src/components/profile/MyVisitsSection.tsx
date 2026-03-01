import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { VisiteComplete } from '../../types/database.types';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { format, isFuture, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase, getPublicUrl } from '../../lib/supabase';

interface MyVisitsSectionProps {
    visits: VisiteComplete[];
}

export default function MyVisitsSection({ visits }: MyVisitsSectionProps) {
    const [filter, setFilter] = useState<'avenir' | 'passe'>('avenir');

    const filteredVisits = visits.filter(v => {
        const isFutur = isFuture(new Date(v.date_visite));
        if (filter === 'avenir') return isFutur && v.statut === 'confirmee';
        return !isFutur || v.statut === 'annulee';
    });

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Mes Visites</Text>
            </View>

            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.pillBtn, filter === 'avenir' && styles.pillActive]}
                    onPress={() => setFilter('avenir')}>
                    <Text style={[styles.pillText, filter === 'avenir' && styles.pillTextActive]}>À venir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.pillBtn, filter === 'passe' && styles.pillActive]}
                    onPress={() => setFilter('passe')}>
                    <Text style={[styles.pillText, filter === 'passe' && styles.pillTextActive]}>Passées / Annulées</Text>
                </TouchableOpacity>
            </View>

            {filteredVisits.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Aucune visite planifiée</Text>
                    <Text style={styles.emptySubText}>Explorez les logements et contactez les propriétaires pour organiser des visites.</Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {filteredVisits.map(v => (
                        <VisitListItem key={v.id_visite} visit={v} />
                    ))}
                </View>
            )}
        </View>
    );
}

const VisitListItem = ({ visit }: { visit: VisiteComplete }) => {
    const isFutur = isFuture(new Date(visit.date_visite));
    const title = visit.conversation?.propriete?.titre || 'Propriété';
    const quartier = visit.conversation?.propriete?.quartier?.nom_quartier || 'Inconnu';
    const photo = getPublicUrl(visit.conversation?.propriete?.photos?.[0]?.url_photo) || 'https://via.placeholder.com/56';
    const diffDays = differenceInDays(new Date(visit.date_visite), new Date());

    return (
        <TouchableOpacity
            style={[styles.listItem, isFutur ? styles.listItemFuture : styles.listItemPast]}
            onPress={() => router.push(`/visite/${visit.id_visite}`)}
        >
            <Image source={{ uri: photo }} style={styles.image} />
            <View style={styles.infoContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{title}</Text>
                    {isFutur ? (
                        <Text style={{ fontSize: 10, color: COLORS.secondary, fontWeight: 'bold' }}>✅ Confirmée</Text>
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 10, color: visit.statut === 'annulee' ? COLORS.danger : COLORS.textSecondary, fontWeight: 'bold' }}>
                                {visit.statut === 'annulee' ? '✗ Annulée' : '✓ Effectuée'}
                            </Text>
                            {visit.statut === 'confirmee' && <VisitReviewBadge visitId={visit.id_visite} dateStr={visit.date_visite} />}
                        </View>
                    )}
                </View>
                <Text style={styles.itemMeta}>📍 {quartier}</Text>
                <Text style={styles.itemMeta}>📆 {format(new Date(visit.date_visite), "EEE. d MMM. 'à' HH:mm", { locale: fr })}</Text>

                {isFutur && diffDays >= 0 && (
                    <Text style={styles.timeTag}>⏱ Dans {diffDays} jour{diffDays > 1 ? 's' : ''}</Text>
                )}
                {!isFutur && (
                    <Text style={styles.itemMeta}>📆 Il y a {-diffDays} jours</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        marginVertical: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    },
    pillBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: 8,
        backgroundColor: COLORS.surface,
    },
    pillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    pillText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    pillTextActive: {
        color: COLORS.surface,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    listContainer: {
        gap: SPACING.sm,
    },
    listItem: {
        flexDirection: 'row',
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
    },
    listItemFuture: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: `${COLORS.secondary}4D`, // 30% opacity
    },
    listItemPast: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        opacity: 0.8,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: BORDER_RADIUS.sm,
    },
    infoContainer: {
        flex: 1,
        marginLeft: SPACING.sm,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
        flex: 1,
    },
    itemMeta: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    timeTag: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.warning,
        fontWeight: '500',
        marginTop: 4,
    }
});

const VisitReviewBadge = ({ visitId, dateStr }: { visitId: string, dateStr: string }) => {
    const { user } = useAuth();
    const [status, setStatus] = React.useState<'loading' | 'none' | 'can_review' | 'rated'>('loading');

    React.useEffect(() => {
        if (!user || isFuture(new Date(dateStr))) {
            setStatus('none');
            return;
        }

        const check = async () => {
            const { data } = await supabase.from('avis').select('id_avis').eq('id_visite', visitId).eq('id_auteur', user.id).maybeSingle();
            if (data) setStatus('rated');
            else setStatus('can_review');
        };
        check();
    }, [visitId, user?.id, dateStr]);

    if (status === 'can_review') return <Text style={{ fontSize: 10, color: COLORS.warning, fontWeight: 'bold', borderWidth: 1, borderColor: COLORS.warning, paddingHorizontal: 4, borderRadius: 4 }}>⭐ Noter</Text>;
    if (status === 'rated') return <Text style={{ fontSize: 10, color: COLORS.secondary, fontWeight: 'bold' }}>⭐ Noté</Text>;
    return null;
};
