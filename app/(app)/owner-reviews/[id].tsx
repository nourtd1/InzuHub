import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { useAvis } from '../../../src/hooks/useAvis';
import { useTranslation } from '../../../src/i18n/useTranslation';
import AvisCard from '../../../src/components/avis/AvisCard';
import { useAuth } from '../../../src/hooks/useAuth';

export default function OwnerReviewsScreen() {
    const { id, nom } = useLocalSearchParams<{ id: string, nom?: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { avis, stats, isLoading, refreshOwnerAvis, deleteMyAvis } = useAvis();
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (id) refreshOwnerAvis(id);
    }, [id]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (id) await refreshOwnerAvis(id);
        setIsRefreshing(false);
    };

    const renderHeader = () => {
        if (!stats) return null;

        const maxReviews = stats.total_avis > 0 ? stats.total_avis : 1; // avoid division by 0

        const renderBar = (note: number, count: number) => {
            const percentage = (count / maxReviews) * 100;
            return (
                <View style={styles.barRow} key={`bar-${note}`}>
                    <Text style={styles.barLabel}>{note} ★</Text>
                    <View style={styles.barTrack}>
                        <View style={[styles.barFill, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.barCount}>({count})</Text>
                </View>
            );
        };

        return (
            <View style={styles.statsCard}>
                <View style={styles.statsLeft}>
                    <Text style={styles.mainNote}>★ {stats.note_moyenne}</Text>
                    <Text style={styles.totalAvis}>{t('reviews.total_reviews', { count: stats.total_avis })}</Text>
                </View>
                <View style={styles.statsRight}>
                    {renderBar(5, stats.cinq_etoiles)}
                    {renderBar(4, stats.quatre_etoiles)}
                    {renderBar(3, stats.trois_etoiles)}
                    {renderBar(2, stats.deux_etoiles)}
                    {renderBar(1, stats.une_etoile)}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{nom ? `Avis de ${nom}` : 'Avis'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading && avis.length === 0 ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlashList
                    data={avis}
                    keyExtractor={item => item.id_avis}
                    renderItem={({ item }) => (
                        <AvisCard
                            avis={item}
                            currentUserId={user?.id}
                            onDelete={() => deleteMyAvis(item.id_avis)}
                        />
                    )}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    estimatedItemSize={150}
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        padding: SPACING.sm,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    listContent: {
        padding: SPACING.md,
    },
    statsCard: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.lg,
        flexDirection: 'row',
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statsLeft: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainNote: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.warning,
        marginBottom: 4,
    },
    totalAvis: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    statsRight: {
        flex: 2,
        justifyContent: 'center',
        paddingLeft: SPACING.md,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border,
    },
    barRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    barLabel: {
        width: 30,
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    barTrack: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.border,
        borderRadius: 4,
        marginHorizontal: 8,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: COLORS.warning,
        borderRadius: 4,
    },
    barCount: {
        width: 30,
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textAlign: 'right',
    },
});
