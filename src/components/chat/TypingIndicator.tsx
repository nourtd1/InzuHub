import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface TypingIndicatorProps {
    isTyping: boolean;
    userAvatar?: string | null;
    userName?: string;
}

export default function TypingIndicator({ isTyping, userAvatar, userName }: TypingIndicatorProps) {
    const { t } = useTranslation();

    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isTyping) {
            Animated.timing(fade, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();

            const createAnimation = (dot: Animated.Value, delay: number) => {
                return Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(dot, {
                            toValue: -6,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.timing(dot, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                        Animated.delay(600 - delay),
                    ])
                );
            };

            const animations = [
                createAnimation(dot1, 0),
                createAnimation(dot2, 150),
                createAnimation(dot3, 300),
            ];

            animations.forEach(a => a.start());

            return () => {
                animations.forEach(a => a.stop());
            };
        } else {
            Animated.timing(fade, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isTyping]);

    if (!isTyping) return null;

    return (
        <Animated.View style={[styles.container, { opacity: fade }]}>
            <View style={styles.avatarContainer}>
                {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.avatar} />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarLabel}>{userName?.charAt(0).toUpperCase()}</Text>
                    </View>
                )}
            </View>

            <View style={styles.bubble}>
                <Text style={styles.text}>{userName} {t('chat.typing')}</Text>
                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
                    <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
                    <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    avatarContainer: {
        marginRight: SPACING.sm,
        marginBottom: 4,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    bubble: {
        flexDirection: 'row',
        backgroundColor: COLORS.border,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        borderBottomLeftRadius: 0,
        alignItems: 'center',
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginRight: SPACING.sm,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 12,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.textSecondary,
        marginHorizontal: 1,
        opacity: 0.6,
    },
});
