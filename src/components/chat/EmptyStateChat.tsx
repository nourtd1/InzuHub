import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface EmptyStateChatProps {
    role: 'locataire' | 'proprietaire';
}

export default function EmptyStateChat({ role }: EmptyStateChatProps) {
    const { t } = useTranslation();

    if (role === 'locataire') {
        return (
            <View style={styles.container}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="chat-bubble-outline" size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />
                </View>
                <Text style={styles.title}>{t('chat.empty_tenant_title')}</Text>
                <Text style={styles.subtitle}>{t('chat.empty_tenant_subtitle')}</Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push('/(app)/(tabs)/')}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{t('chat.empty_tenant_cta')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialIcons name="home-work" size={80} color={COLORS.primary} style={{ opacity: 0.3 }} />
            </View>
            <Text style={styles.title}>{t('chat.empty_owner_title')}</Text>
            <Text style={styles.subtitle}>{t('chat.empty_owner_subtitle')}</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/(app)/post/media')}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>{t('chat.empty_owner_cta')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        backgroundColor: COLORS.background,
    },
    iconContainer: {
        marginBottom: SPACING.lg,
        backgroundColor: COLORS.surface,
        padding: SPACING.xl,
        borderRadius: BORDER_RADIUS.full,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: SPACING.xxl,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
});
