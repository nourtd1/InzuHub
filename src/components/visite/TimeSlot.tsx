import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface TimeSlotProps {
    heure: string;
    isSelected: boolean;
    isAvailable: boolean;
    onPress: () => void;
}

export default function TimeSlot({ heure, isSelected, isAvailable, onPress }: TimeSlotProps) {
    return (
        <TouchableOpacity
            style={[
                styles.slot,
                isSelected && styles.slotSelected,
                !isAvailable && styles.slotUnavailable
            ]}
            onPress={isAvailable ? onPress : undefined}
            disabled={!isAvailable}
            activeOpacity={0.7}
        >
            <Text style={[
                styles.text,
                isSelected && styles.textSelected,
                !isAvailable && styles.textUnavailable
            ]}>
                {heure.replace(':', 'h')}
            </Text>
            {!isAvailable && (
                <MaterialIcons name="lock" size={14} color={COLORS.textSecondary} style={{ marginLeft: 4, opacity: 0.5 }} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    slot: {
        flex: 1,
        margin: 4,
        paddingVertical: 12,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    slotSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    slotUnavailable: {
        backgroundColor: COLORS.background,
        opacity: 0.5,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    textSelected: {
        color: COLORS.surface,
    },
    textUnavailable: {
        color: COLORS.textSecondary,
        textDecorationLine: 'line-through',
    }
});
