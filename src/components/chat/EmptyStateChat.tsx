import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { Button } from '../ui/Button';
import { useTranslation } from '../../i18n/useTranslation';

interface EmptyStateChatProps {
    role: 'locataire' | 'proprietaire' | 'administrateur';
}

export default function EmptyStateChat({ role }: EmptyStateChatProps) {
    const isLocataire = role === 'locataire';
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialIcons name="chat-bubble-outline" size={64} color={COLORS.primary} />
                <View style={styles.subIconBadge}>
                    <MaterialIcons
                        name={isLocataire ? "home" : "people"}
                        size={24}
                        color={COLORS.surface}
                    />
                </View>
            </View>

            <Text style={styles.title}>
                {isLocataire ? t('chat.empty_tenant_title') : t('chat.empty_owner_title')}
            </Text>

            <Text style={styles.subtitle}>
                {isLocataire
                    ? t('chat.empty_tenant_subtitle')
                    : t('chat.empty_owner_subtitle')}
            </Text>

            <Button
                title={isLocataire ? t('chat.empty_tenant_cta') : t('chat.empty_owner_cta')}
                onPress={() => {
                    if (isLocataire) {
                        router.push('/(app)/(tabs)/');
                    } else {
                        // Supposing there is a post media tab or page
                        // Adjust URL if it differs in reality
                        router.push('/(app)/(tabs)/'); // Adjust based on your routing for landlords
                    }
                }}
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
        marginTop: 60,
    },
    iconContainer: {
        position: 'relative',
        marginBottom: SPACING.lg,
    },
    subIconBadge: {
        position: 'absolute',
        bottom: -5,
        right: -10,
        backgroundColor: COLORS.secondary,
        borderRadius: 20,
        padding: 6,
        borderWidth: 3,
        borderColor: COLORS.background,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 22,
    },
    button: {
        minWidth: 200,
    }
});
