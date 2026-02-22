import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface CaracteristiqueItemProps {
    emoji: string;
    label: string;
    value: string | number | boolean;
}

export default function CaracteristiqueItem({ emoji, label, value }: CaracteristiqueItemProps) {
    const isBoolean = typeof value === 'boolean';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>

            <View style={styles.valueContainer}>
                {isBoolean ? (
                    <View style={styles.booleanContainer}>
                        <Text style={[styles.value, { color: value ? COLORS.secondary : COLORS.danger }]}>
                            {value ? 'Oui' : 'Non'}
                        </Text>
                        <MaterialIcons
                            name={value ? "check" : "close"}
                            size={16}
                            color={value ? COLORS.secondary : COLORS.danger}
                            style={styles.icon}
                        />
                    </View>
                ) : (
                    <Text style={styles.value}>{value}</Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        margin: SPACING.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    emoji: {
        fontSize: 16,
        marginRight: SPACING.xs,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    valueContainer: {
        marginTop: 'auto',
    },
    value: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    },
    booleanContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginLeft: 4,
    },
});
