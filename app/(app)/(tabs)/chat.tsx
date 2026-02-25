import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';

import { useConversations } from '../../../src/hooks/useConversations';
import { useAuth } from '../../../src/hooks/useAuth';
import { getConversationPeriod, getPeriodLabel } from '../../../src/utils/formatters';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { ConversationListItem } from '../../../src/services/conversationService';

import ConversationItem from '../../../src/components/chat/ConversationItem';
import SwipeableConversationItem from '../../../src/components/chat/SwipeableConversationItem';
import EmptyStateChat from '../../../src/components/chat/EmptyStateChat';
import { useTranslation } from '../../../src/i18n/useTranslation';

export default function ChatListScreen() {
    const { user, profile } = useAuth();
    const { conversations, isRefreshing, refresh, deleteConversation } = useConversations();
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const lowerQ = searchQuery.toLowerCase();
        return conversations.filter(c =>
            c.interlocuteur?.nom_complet?.toLowerCase().includes(lowerQ) ||
            c.propriete?.titre?.toLowerCase().includes(lowerQ)
        );
    }, [conversations, searchQuery]);

    const groupedData = useMemo(() => {
        const sections: { title: string; data: ConversationListItem[] }[] = [
            { title: 'today', data: [] },
            { title: 'week', data: [] },
            { title: 'older', data: [] }
        ];

        filteredConversations.forEach(conv => {
            const dateStr = conv.dernier_message?.date_envoi || conv.date_creation;
            const period = getConversationPeriod(dateStr);
            const section = sections.find(s => s.title === period);
            if (section) section.data.push(conv);
        });

        return sections.filter(section => section.data.length > 0);
    }, [filteredConversations]);

    const handlePress = (convId: string) => {
        router.push(`/chat/${convId}`);
    };

    const handleDelete = async (convId: string) => {
        try {
            await deleteConversation(convId);
        } catch (error) {
            // Error managed in hook or Alert
        }
    };

    const renderHeader = () => {
        if (conversations.length <= 3) return null; // Only show search if > 3 convs

        return (
            <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color={COLORS.textSecondary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={t('chat.search_placeholder')}
                    placeholderTextColor={COLORS.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <MaterialIcons name="close" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (conversations.length === 0 && !isRefreshing) {
        return <EmptyStateChat role={profile?.role || 'locataire'} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('chat.title')}</Text>
                <Text style={styles.subtitle}>
                    {t(conversations.length > 1 ? 'chat.active_count_plural' : 'chat.active_count', { count: conversations.length })}
                </Text>
            </View>

            {renderHeader()}

            <SectionList
                sections={groupedData}
                keyExtractor={item => item.id_conversation}
                renderItem={({ item }) => (
                    <SwipeableConversationItem onDelete={() => handleDelete(item.id_conversation)}>
                        <ConversationItem
                            conversation={item}
                            currentUserId={user?.id || ''}
                            onPress={() => handlePress(item.id_conversation)}
                        />
                    </SwipeableConversationItem>
                )}
                renderSectionHeader={({ section: { title } }) => (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{t(`chat.periods.${title}`)}</Text>
                    </View>
                )}
                onRefresh={refresh}
                refreshing={isRefreshing}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
            />

            {profile?.role === 'locataire' && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPress={() => router.push('/(app)/(tabs)/')}
                >
                    <MaterialIcons name="search" size={20} color={COLORS.surface} style={styles.fabIcon} />
                    <Text style={styles.fabText}>{t('chat.search_property')}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60, // Safe area approx
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        margin: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.full,
        height: 44,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    listContent: {
        paddingBottom: 80, // Space for FAB
    },
    sectionHeader: {
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.xs,
        marginTop: SPACING.sm,
    },
    sectionHeaderText: {
        textTransform: 'uppercase',
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        letterSpacing: 1,
        fontWeight: '600',
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
    },
    fabIcon: {
        marginRight: 6,
    },
    fabText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
});
