import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface ToggleCardProps {
    emoji: string;
    label: string;
    sublabel?: string;
    value: boolean;
    onToggle: () => void;
    activeColor: string;
}

export default function ToggleCard({ emoji, label, sublabel, value, onToggle, activeColor }: ToggleCardProps) {
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
                onPress={onToggle}
                style={[
                    styles.container,
                    value ? { backgroundColor: `${activeColor}1A`, borderColor: activeColor } : styles.unselected
                ]}
            >
                <View style={styles.content}>
                    <Text style={styles.emoji}>{emoji}</Text>
                    <View style={styles.textContainer}>
                        <Text style={[styles.label, value ? { color: activeColor } : { color: COLORS.textSecondary }]}>{label}</Text>
                        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
                    </View>
                </View>
                {value && (
                    <MaterialIcons
                        name="check-circle"
                        size={18}
                        color={activeColor}
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
        position: 'relative',
        height: 72,
        marginBottom: SPACING.sm,
        borderWidth: 1,
    },
    unselected: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 24,
        marginRight: SPACING.sm,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    },
    sublabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    icon: {
        position: 'absolute',
        top: 6,
        right: 6,
    }
});
