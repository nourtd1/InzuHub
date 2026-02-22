import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface QuartierChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

export const QuartierChip: React.FC<QuartierChipProps> = ({ label, isActive, onPress }) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                isActive ? styles.activeContainer : styles.inactiveContainer,
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text
                style={[
                    styles.text,
                    isActive ? styles.activeText : styles.inactiveText,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        marginRight: SPACING.sm,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeContainer: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    inactiveContainer: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
    },
    activeText: {
        color: '#FFFFFF',
    },
    inactiveText: {
        color: COLORS.textSecondary,
    },
});
