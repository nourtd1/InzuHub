
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    if (!password) return null;

    const getStrength = (pass: string) => {
        if (pass.length < 8) return 'Faible';
        if (pass.length < 12) return 'Moyen';
        return 'Fort';
    };

    const strength = getStrength(password);

    const getColors = () => {
        switch (strength) {
            case 'Faible':
                return [COLORS.danger, COLORS.border, COLORS.border];
            case 'Moyen':
                return [COLORS.warning, COLORS.warning, COLORS.border];
            case 'Fort':
                return [COLORS.secondary, COLORS.secondary, COLORS.secondary];
            default:
                return [COLORS.border, COLORS.border, COLORS.border];
        }
    };

    const colors = getColors();

    return (
        <View style={styles.container}>
            <View style={styles.bars}>
                {colors.map((color, index) => (
                    <View key={index} style={[styles.bar, { backgroundColor: color }]} />
                ))}
            </View>
            <Text style={styles.text}>{strength}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: SPACING.xs / 2,
        marginBottom: SPACING.md,
    },
    bars: {
        flexDirection: 'row',
        gap: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    bar: {
        flex: 1,
        height: 4,
        borderRadius: 2,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textAlign: 'right',
    },
});
