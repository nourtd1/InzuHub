import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useConversations } from '../../../src/hooks/useConversations';
import { useAuth } from '../../../src/hooks/useAuth';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../../src/constants/theme';
import { getConversationPeriod } from '../../../src/utils/formatters';
import { useTranslation } from 'react-i18next';

import ConversationItem from '../../../src/components/chat/ConversationItem';
import SwipeableConversationItem from '../../../src/components/chat/SwipeableConversationItem';
import EmptyStateChat from '../../../src/components/chat/EmptyStateChat';

export default function ChatListScreen() {
    const { user, profile } = useAuth();
    const {
        conversations,
        isLoading,
        isRefreshing,
        refresh,
        deleteConversation,
        totalUnread
    } = useConversations();

    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslation();

    const filteredConversations = useMemo(() => {
        if (!searchQuery.trim()) return conversations;
        const lowerQ = searchQuery.toLowerCase();
        return conversations.filter(c =>
            c.locataire.nom_complet.toLowerCase().includes(lowerQ) ||
            c.proprietaire.nom_complet.toLowerCase().includes(lowerQ) ||
            c.propriete.titre.toLowerCase().includes(lowerQ)
        );
    }, [conversations, searchQuery]);

    const groupedData = useMemo(() => {
        const sections: { title: 'today' | 'week' | 'older'; data: any[] }[] = [
            { title: 'today', data: [] },
            { title: 'week', data: [] },
            { title: 'older', data: [] }
        ];

        filteredConversations.forEach(conv => {
            const dateStr = conv.dernier_message?.date_envoi || conv.derniere_activite;
            const period = getConversationPeriod(dateStr);
            const section = sections.find(s => s.title === period);
            if (section) section.data.push(conv);
        });

        return sections.filter(section => section.data.length > 0);
    }, [filteredConversations]);

    const handlePress = useCallback((convId: string) => {
        router.push(`/chat/${convId}`);
    }, []);

    const handleDelete = async (convId: string) => {
        try {
            await deleteConversation(convId);
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading && !isRefreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    if (conversations.length === 0 && !isRefreshing) {
        const currentRole = profile?.role === 'administrateur' ? 'locataire' : (profile?.role || 'locataire');
        return <EmptyStateChat role={currentRole} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t('chat.title')}</Text>
                    <Text style={styles.subtitle}>
                        {totalUnread > 0
                            ? t('chat.unread_count', { count: totalUnread })
                            : t('chat.no_unread')
                        }
                    </Text>
                </View>
            </View>

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
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={refresh} colors={[COLORS.primary]} />
                }
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
            />

            {profile?.role === 'locataire' && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPress={() => router.push('/(app)/(tabs)/')}
                >
                    <MaterialIcons name="add" size={24} color={COLORS.surface} />
                    <Text style={styles.fabText}>{t('chat.new_chat')}</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeXXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        height: 48,
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
        paddingBottom: 100,
    },
    sectionHeader: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    sectionHeaderText: {
        textTransform: 'uppercase',
        fontSize: 11,
        color: COLORS.textSecondary,
        letterSpacing: 1.2,
        fontWeight: '700',
    },
    fab: {
        position: 'absolute',
        bottom: SPACING.lg,
        right: SPACING.lg,
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.lg,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    fabText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeMD,
        marginLeft: 8,
    },
});
