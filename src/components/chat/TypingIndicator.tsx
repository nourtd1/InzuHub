import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

export default function TypingIndicator() {
    const dot1Anim = useRef(new Animated.Value(0)).current;
    const dot2Anim = useRef(new Animated.Value(0)).current;
    const dot3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const bounce = (anim: Animated.Value, delay: number) => {
            return Animated.sequence([
                Animated.delay(delay),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: -5,
                            duration: 250,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 250,
                            useNativeDriver: true,
                        }),
                        Animated.delay(500),
                    ])
                )
            ]);
        };

        bounce(dot1Anim, 0).start();
        bounce(dot2Anim, 150).start();
        bounce(dot3Anim, 300).start();

        return () => {
            dot1Anim.stopAnimation();
            dot2Anim.stopAnimation();
            dot3Anim.stopAnimation();
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.bubble}>
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot1Anim }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot2Anim }] }]} />
                <Animated.View style={[styles.dot, { transform: [{ translateY: dot3Anim }] }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 4,
        paddingHorizontal: SPACING.md,
        alignItems: 'flex-start',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.textSecondary,
        marginHorizontal: 3,
    }
});
