import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { useFavoris } from '../../src/store/FavorisContext';
import { useTranslation } from '../../src/i18n/useTranslation';
import PropertyCard from '../../src/components/property/PropertyCard';
import { Swipeable } from 'react-native-gesture-handler';

export default function FavoritesScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { favoris, isLoading, isRefreshing, refreshFavoris, toggleFavori } = useFavoris();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleRemove = async (propertyId: string) => {
        Alert.alert(
            t('favorites.remove_confirm'),
            '',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.yes'), style: 'destructive', onPress: async () => {
                        setDeletingId(propertyId);
                        try {
                            await toggleFavori(propertyId);
                        } catch (e) {
                            console.error('Failed to remove favori', e);
                        } finally {
                            setDeletingId(null);
                        }
                    }
                }
            ]
        );
    };

    const renderRightActions = (propertyId: string) => {
        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleRemove(propertyId)}
            >
                <Ionicons name="trash-outline" size={24} color={COLORS.surface} />
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    const titleText = `${favoris.length} ${favoris.length > 1 ? t('favorites.count_plural', { count: '' }).trim() : t('favorites.count', { count: '' }).trim()}`;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{t('favorites.title')}</Text>
                    {favoris.length > 0 && <Text style={styles.headerSubtitle}>{titleText}</Text>}
                </View>
                <View style={{ width: 24 }} /> {/* Balance */}
            </View>

            {favoris.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="heart-half-outline" size={80} color={COLORS.border} />
                    <Text style={styles.emptyTitle}>{t('favorites.empty_title')}</Text>
                    <Text style={styles.emptySubtitle}>{t('favorites.empty_subtitle')}</Text>
                    <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(app)/(tabs)/')}>
                        <Text style={styles.exploreButtonText}>{t('favorites.explore_cta')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    <FlashList
                        data={favoris}
                        keyExtractor={item => item.id_favori}
                        renderItem={({ item }) => (
                            <Swipeable
                                renderRightActions={() => renderRightActions(item.id_propriete)}
                                overshootRight={false}
                            >
                                <View style={styles.itemWrapper}>
                                    <PropertyCard
                                        property={item.propriete as any} // we cast to bypass deep type strictness if needed
                                        onPress={() => router.push(`/(app)/property/${item.id_propriete}`)}
                                    />
                                    {deletingId === item.id_propriete && (
                                        <View style={styles.overlayLoading}>
                                            <ActivityIndicator color={COLORS.surface} />
                                        </View>
                                    )}
                                </View>
                            </Swipeable>
                        )}
                        estimatedItemSize={320}
                        onRefresh={() => refreshFavoris(false)}
                        refreshing={isRefreshing}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
        zIndex: 10,
    },
    backButton: {
        padding: SPACING.xs,
        marginLeft: -SPACING.xs,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    headerSubtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
    },
    emptyTitle: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginTop: SPACING.lg,
        marginBottom: SPACING.sm,
    },
    emptySubtitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: SPACING.xl,
    },
    exploreButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: 14,
        borderRadius: 25,
    },
    exploreButtonText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
    },
    listContent: {
        padding: SPACING.md,
    },
    itemWrapper: {
        marginBottom: SPACING.md,
        position: 'relative',
    },
    deleteAction: {
        backgroundColor: COLORS.danger,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: SPACING.xl,
        marginBottom: SPACING.md,
        height: '100%',
        width: 100, // Enough area to catch swipe
        borderRadius: 16,
    },
    overlayLoading: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    }
});
