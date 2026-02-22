
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface RoleSelectorProps {
    value: 'locataire' | 'proprietaire';
    onChange: (role: 'locataire' | 'proprietaire') => void;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
    const scaleAnimLocataire = React.useRef(new Animated.Value(1)).current;
    const scaleAnimProprietaire = React.useRef(new Animated.Value(1)).current;

    const animatePress = (anim: Animated.Value) => {
        Animated.sequence([
            Animated.timing(anim, {
                toValue: 0.97,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(anim, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = (role: 'locataire' | 'proprietaire') => {
        if (role === 'locataire') {
            animatePress(scaleAnimLocataire);
        } else {
            animatePress(scaleAnimProprietaire);
        }
        onChange(role);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Je suis un...</Text>
            <View style={styles.row}>
                <AnimatedTouchableOpacity
                    style={[
                        styles.card,
                        value === 'locataire' && styles.cardActive,
                        { transform: [{ scale: scaleAnimLocataire }] }
                    ]}
                    onPress={() => handlePress('locataire')}
                    activeOpacity={0.9}
                >
                    <Text style={styles.emoji}>🔍</Text>
                    <Text style={[
                        styles.text,
                        value === 'locataire' && styles.textActive
                    ]}>
                        Locataire
                    </Text>
                </AnimatedTouchableOpacity>

                <AnimatedTouchableOpacity
                    style={[
                        styles.card,
                        value === 'proprietaire' && styles.cardActive,
                        { transform: [{ scale: scaleAnimProprietaire }] }
                    ]}
                    onPress={() => handlePress('proprietaire')}
                    activeOpacity={0.9}
                >
                    <Text style={styles.emoji}>🏠</Text>
                    <Text style={[
                        styles.text,
                        value === 'proprietaire' && styles.textActive
                    ]}>
                        Propriétaire
                    </Text>
                </AnimatedTouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    card: {
        flex: 1, // Deux cartes côte à côte
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
    },
    cardActive: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(27, 79, 255, 0.1)', // Primary color with 10% opacity
    },
    emoji: {
        fontSize: 20,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    textActive: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
