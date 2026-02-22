import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useProperties } from '../../../src/hooks/useProperties';
import { useAuth } from '../../../src/hooks/useAuth';
import { PropertyCard } from '../../../src/components/property/PropertyCard';
import { FilterModal } from '../../../src/components/property/FilterModal';
import { QuartierChip } from '../../../src/components/ui/QuartierChip';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { ProprieteAvecPhotos } from '../../../src/types/database.types';

export default function HomeScreen() {
    const router = useRouter();
    const {
        properties,
        quartiers,
        isLoading,
        isRefreshing,
        refresh,
        filters,
        activeFiltersCount,
        setFilters,
        resetFilters,
        searchQuery,
        setSearchQuery
    } = useProperties();

    const { profile } = useAuth();
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const handlePropertyPress = (id: string) => {
        // Navigate to property details
        // router.push(`/property/${id}`);
        console.log('Navigate to property', id);
    };

    const handleQuartierSelect = (id: string | undefined) => {
        setFilters({ ...filters, id_quartier: id });
    };

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    const renderHeader = () => (
        <View style={styles.listHeader}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un quartier, titre..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="options-outline" size={24} color={COLORS.primary} />
                    {activeFiltersCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Quartier Filter */}
            <View style={styles.quartierListContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.quartierContentContainer}
                >
                    <QuartierChip
                        label="Tous"
                        isActive={!filters.id_quartier}
                        onPress={() => handleQuartierSelect(undefined)}
                    />
                    {quartiers.map((q) => (
                        <QuartierChip
                            key={q.id_quartier}
                            label={q.nom_quartier}
                            isActive={filters.id_quartier === q.id_quartier}
                            onPress={() => handleQuartierSelect(q.id_quartier)}
                        />
                    ))}
                </ScrollView>
            </View>

            {/* Result Counter */}
            <View style={styles.resultCounterContainer}>
                <Text style={styles.resultCounterText}>
                    {isLoading ? 'Chargement...' : `${properties.length} logements disponibles`}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Fixed Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.logoText}>InzuHub</Text>
                    <Text style={styles.subtitleText}>Gisenyi, Rwanda</Text>
                </View>
                <TouchableOpacity style={styles.avatarContainer}>
                    {profile?.avatar_url ? (
                        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Text style={styles.avatarInitials}>
                                {profile?.nom_complet ? getInitials(profile.nom_complet) : 'IH'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Main List */}
            <FlashList
                data={properties}
                renderItem={({ item }: { item: ProprieteAvecPhotos }) => (
                    <PropertyCard
                        property={item as any} // Cast needed because PropertyCard expects join result which service returns but types might differ slightly in strictness
                        onPress={() => handlePropertyPress(item.id_propriete)}
                    />
                )}
                estimatedItemSize={280}
                keyExtractor={(item) => item.id_propriete}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    !isLoading ? (
                        <EmptyState
                            title="Aucun logement trouvé"
                            subtitle="Essayez de modifier vos filtres ou revenez plus tard"
                            actionLabel="Réinitialiser les filtres"
                            onAction={resetFilters}
                        />
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[COLORS.primary]} />
                }
            />

            {/* Filter Modal */}
            <FilterModal
                visible={isFilterModalVisible}
                onClose={() => setFilterModalVisible(false)}
                filters={filters}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    // Search query is separate state, handled by hook
                }}
                onReset={resetFilters}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    logoText: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    subtitleText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    avatarContainer: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    listHeader: {
        marginBottom: SPACING.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        marginTop: SPACING.sm,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.sm,
    },
    searchInput: {
        flex: 1,
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    filterButton: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        position: 'relative',
    },
    filterBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.danger, // Red badge
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    filterBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    quartierListContainer: {
        marginBottom: SPACING.md,
    },
    quartierContentContainer: {
        paddingHorizontal: SPACING.md,
    },
    resultCounterContainer: {
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    resultCounterText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
});
