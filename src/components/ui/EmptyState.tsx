import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface EmptyStateProps {
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    subtitle,
    actionLabel,
    onAction
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {/* Using a large icon for empty state */}
                <Ionicons name="home-outline" size={48} color={COLORS.primary} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            {actionLabel && onAction && (
                <TouchableOpacity
                    style={styles.button}
                    onPress={onAction}
                    activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.lg,
        minHeight: 300,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.background, // Using background color which is slightly off-white/blue
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
    button: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        borderWidth: 1,
        borderColor: COLORS.primary,
        backgroundColor: COLORS.surface,
    },
    buttonText: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
});
