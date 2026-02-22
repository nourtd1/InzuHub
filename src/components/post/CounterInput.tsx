import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface CounterInputProps {
    label: string;
    emoji: string;
    value: number;
    min: number;
    max: number;
    onChange: (v: number) => void;
}

export default function CounterInput({ label, emoji, value, min, max, onChange }: CounterInputProps) {
    const handlePress = (v: number) => {
        if (v >= min && v <= max) {
            onChange(v);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>{emoji}</Text>
                <Text style={styles.label}>{label}</Text>
            </View>
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.btn, value <= min && styles.btnDisabled]}
                    disabled={value <= min}
                    onPress={() => handlePress(value - 1)}
                >
                    <MaterialIcons name="remove" size={24} color={value <= min ? COLORS.textSecondary : COLORS.textPrimary} />
                </TouchableOpacity>

                <Text style={styles.value}>{value}</Text>

                <TouchableOpacity
                    style={[styles.btn, value >= max && styles.btnDisabled]}
                    disabled={value >= max}
                    onPress={() => handlePress(value + 1)}
                >
                    <MaterialIcons name="add" size={24} color={value >= max ? COLORS.textSecondary : COLORS.textPrimary} />
                </TouchableOpacity>
            </View>
            {label === 'Salons' && value === 0 && <Text style={styles.hint}>Studio / Sans salon</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    emoji: {
        fontSize: 18,
        marginRight: 6,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.full,
        padding: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    btn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDisabled: {
        opacity: 0.5,
    },
    value: {
        width: 40,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    hint: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 4,
    }
});
