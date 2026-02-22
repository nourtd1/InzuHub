
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    fullWidth = false,
    style,
}: ButtonProps) {
    const getContainerStyle = (): ViewStyle => {
        let containerStyle: ViewStyle = {};

        switch (variant) {
            case 'primary':
                containerStyle = {
                    backgroundColor: COLORS.primary,
                    borderWidth: 0,
                };
                break;
            case 'outline':
                containerStyle = {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: COLORS.primary,
                };
                break;
            case 'ghost':
                containerStyle = {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
                break;
        }

        if (disabled) {
            containerStyle.opacity = 0.5;
        }

        return containerStyle;
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'primary':
                return { color: '#FFFFFF' };
            case 'outline':
            case 'ghost':
                return { color: COLORS.primary };
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.baseContainer,
                getContainerStyle(),
                fullWidth ? styles.fullWidth : null,
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : COLORS.primary} />
            ) : (
                <Text style={[styles.text, getTextStyle()]}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    baseContainer: {
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    fullWidth: {
        width: '100%',
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '600',
    },
});
