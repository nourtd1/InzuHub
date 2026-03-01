import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

export interface StarRatingProps {
    value: number; // 0 to 5
    onChange?: (note: number) => void;
    size?: number; // default 24
    color?: string; // default warning (#FFA502)
    showValue?: boolean;
    totalAvis?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
    value,
    onChange,
    size = 24,
    color = COLORS.warning,
    showValue = false,
    totalAvis
}) => {
    const isInteractive = onChange !== undefined;
    const animations = useRef([...Array(5)].map(() => new Animated.Value(1))).current;

    const handlePress = (index: number) => {
        if (!isInteractive) return;

        const newNote = index + 1;

        Animated.sequence([
            Animated.timing(animations[index], {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(animations[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            })
        ]).start();

        onChange(newNote);
    };

    const renderStar = (index: number) => {
        const starValue = index + 1;
        let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';

        if (value >= starValue) {
            iconName = 'star';
        } else if (value >= starValue - 0.5) {
            iconName = 'star-half';
        }

        return (
            <TouchableWithoutFeedback key={index} onPress={() => handlePress(index)} disabled={!isInteractive}>
                <Animated.View style={{ transform: [{ scale: animations[index] }], paddingHorizontal: 2 }}>
                    <Ionicons name={iconName} size={size} color={color} />
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.starsContainer}>
                {[0, 1, 2, 3, 4].map(renderStar)}
            </View>
            {(showValue || totalAvis !== undefined) && (
                <Text style={styles.textContainer}>
                    {showValue && <Text style={[styles.valueText, { color: COLORS.primary }]}> {parseFloat(value.toFixed(1))} </Text>}
                    {totalAvis !== undefined && <Text style={styles.totalText}>({totalAvis})</Text>}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: SPACING.xs,
    },
    valueText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    totalText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginLeft: 4,
    }
});

export default StarRating;
