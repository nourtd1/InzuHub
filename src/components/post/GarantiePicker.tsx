import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface GarantiePickerProps {
    value: number; // 0 to 6
    onChange: (v: number) => void;
    prixMensuel: number;
}

export default function GarantiePicker({ value, onChange, prixMensuel }: GarantiePickerProps) {
    const format = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const garantieAmount = value * prixMensuel;
    const totalAmount = prixMensuel + garantieAmount;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Garantie exigée (mois)</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {[0, 1, 2, 3, 4, 5, 6].map(num => (
                    <TouchableOpacity
                        key={num}
                        style={[styles.pill, value === num && styles.pillActive]}
                        onPress={() => onChange(num)}
                    >
                        <Text style={[styles.pillText, value === num && styles.pillTextActive]}>
                            {num === 0 ? "Pas de garantie" : `${num} mois`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {prixMensuel > 0 && (
                <View style={styles.calculationBox}>
                    <Text style={styles.calcTitle}>Le locataire devra prévoir à l'entrée :</Text>
                    <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Loyer (1 mois) :</Text>
                        <Text style={styles.calcValue}>{format(prixMensuel)} RWF</Text>
                    </View>
                    {value > 0 && (
                        <View style={styles.calcRow}>
                            <Text style={styles.calcLabel}>Garantie ({value} mois) :</Text>
                            <Text style={styles.calcValue}>{format(garantieAmount)} RWF</Text>
                        </View>
                    )}
                    <View style={styles.divider} />
                    <View style={styles.calcRow}>
                        <Text style={styles.calcTotalLabel}>Total à l'entrée :</Text>
                        <Text style={styles.calcTotalValue}>{format(totalAmount)} RWF</Text>
                    </View>
                </View>
            )}
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
    scrollContent: {
        flexDirection: 'row',
        gap: 8,
        paddingBottom: 4, // for shadow/scroll spacing
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    pillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    pillText: {
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    pillTextActive: {
        color: COLORS.surface,
        fontWeight: 'bold',
    },
    calculationBox: {
        marginTop: SPACING.md,
        padding: SPACING.md,
        backgroundColor: `${COLORS.warning}14`,
        borderColor: `${COLORS.warning}4D`,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.md,
    },
    calcTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    calcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    calcLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    calcValue: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: `${COLORS.warning}4D`,
        marginVertical: 8,
    },
    calcTotalLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    calcTotalValue: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.primary,
    }
});
