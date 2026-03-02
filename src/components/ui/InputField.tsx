
import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';

interface InputFieldProps extends TextInputProps {
    label: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry,
    keyboardType,
    leftIcon,
    rightIcon,
    ...props
}: InputFieldProps) {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const isPassword = secureTextEntry;

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={[styles.inputContainer, error ? styles.inputError : null]}>
                {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    keyboardType={keyboardType}
                    selectionColor={COLORS.primary}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                        {isPasswordVisible ? (
                            <Feather name="eye-off" size={20} color={COLORS.textSecondary} />
                        ) : (
                            <Feather name="eye" size={20} color={COLORS.textSecondary} />
                        )}
                    </TouchableOpacity>
                )}

                {!isPassword && rightIcon && (
                    <View style={styles.iconContainer}>
                        {rightIcon}
                    </View>
                )}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: COLORS.surface,
        height: 48,
    },
    input: {
        flex: 1,
        paddingHorizontal: SPACING.md,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        height: '100%',
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    iconContainer: {
        paddingHorizontal: SPACING.md,
    },
    leftIconContainer: {
        paddingLeft: SPACING.md,
        paddingRight: SPACING.sm,
    },
    errorText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.danger,
        marginTop: SPACING.xs,
    },
});
