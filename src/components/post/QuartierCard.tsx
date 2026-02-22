import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Quartier } from '../../types/database.types';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface QuartierCardProps {
    quartier: Quartier;
    isSelected: boolean;
    onPress: () => void;
}

export default function QuartierCard({ quartier, isSelected, onPress }: QuartierCardProps) {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '48%' }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={onPress}
                style={[styles.container, isSelected ? styles.selected : styles.unselected]}
            >
                <Text style={[styles.text, isSelected ? styles.textSelected : styles.textUnselected]}>
                    {quartier.nom_quartier}
                </Text>
                {isSelected && (
                    <MaterialIcons
                        name="check-circle"
                        size={16}
                        color={COLORS.surface}
                        style={styles.icon}
                    />
                )}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        height: 56,
        marginBottom: SPACING.sm,
        borderWidth: 1,
    },
    unselected: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
    },
    selected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    textUnselected: {
        color: COLORS.textPrimary,
    },
    textSelected: {
        color: COLORS.surface,
    },
    icon: {
        position: 'absolute',
        top: 6,
        right: 6,
    }
});
