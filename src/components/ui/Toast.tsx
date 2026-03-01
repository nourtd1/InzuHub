import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ToastComponentProps {
    message: string;
    type: 'success' | 'warning' | 'error' | 'info';
    onHide: () => void;
}

const Toast: React.FC<ToastComponentProps> = ({ message, type, onHide }) => {
    const translateY = useRef(new Animated.Value(100)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            })
        ]).start();

        // The timeout is handled by the provider to unmount, 
        // but let's animate out slightly before unmount if possible, or just let it unmount
        // For a clean exit, let's just let it be unmounted abruptly or by provider
    }, [translateY, opacity]);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'warning': return 'warning';
            case 'error': return 'close-circle';
            case 'info': return 'information-circle';
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success': return COLORS.secondary;
            case 'warning': return COLORS.warning;
            case 'error': return COLORS.danger;
            case 'info': return COLORS.primary;
        }
    };

    return (
        <Animated.View style={[
            styles.container,
            { bottom: Math.max(insets.bottom, SPACING.lg) + 60 }, // Above tab bar
            { transform: [{ translateY }], opacity }
        ]}>
            <View style={[styles.content, { backgroundColor: getBgColor() }]}>
                <Ionicons name={getIcon()} size={20} color={COLORS.surface} style={styles.icon} />
                <Text style={styles.message}>{message}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: SPACING.lg,
        right: SPACING.lg,
        alignItems: 'center',
        zIndex: 9999,
        elevation: 9999,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.full,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    icon: {
        marginRight: SPACING.sm,
    },
    message: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
    },
});

export default Toast;
