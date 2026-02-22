import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    style?: ViewStyle;
}

export default function SectionTitle({ title, subtitle, style }: SectionTitleProps) {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            <View style={styles.separator} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xs,
    },
    separator: {
        height: 2,
        width: 40,
        backgroundColor: COLORS.primary,
        borderRadius: 1,
        marginTop: SPACING.xs,
    },
});
