import React, { useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Easing } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

interface RecenterButtonProps {
    onPress: () => void;
    style?: object;
    icon?: "my-location" | "location-searching";
}

export default function RecenterButton({ onPress, style, icon = "my-location" }: RecenterButtonProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;

    const handlePress = () => {
        onPress();
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={[styles.button, style]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <MaterialIcons name={icon} size={24} color={COLORS.textPrimary} />
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        width: 48,
        height: 48,
        backgroundColor: COLORS.surface,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 6,
    },
});
