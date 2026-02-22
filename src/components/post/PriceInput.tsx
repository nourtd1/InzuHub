import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface PriceInputProps {
    value: string;
    onChangeText: (v: string) => void;
    error?: string;
    label: string;
    placeholder?: string;
}

export default function PriceInput({ value, onChangeText, error, label, placeholder }: PriceInputProps) {

    const formatNumber = (val: string) => {
        const numeric = val.replace(/\D/g, '');
        return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    };

    const handleChange = (text: string) => {
        const numeric = text.replace(/\D/g, '');
        onChangeText(numeric);
    };

    const formattedValue = formatNumber(value);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
                <TextInput
                    style={styles.input}
                    value={formattedValue}
                    onChangeText={handleChange}
                    placeholder={placeholder}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textSecondary}
                />
                <Text style={styles.suffix}>RWF/mois</Text>
            </View>

            {value.length > 0 && !error && (
                <Text style={styles.displayFormat}>
                    = {formattedValue} RWF par mois
                </Text>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    suffix: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        fontWeight: 'bold',
    },
    displayFormat: {
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    errorText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.fontSizeXS,
        marginTop: 4,
    }
});
