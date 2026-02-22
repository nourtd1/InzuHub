
import { StyleSheet, TextInput, View, Text, TextInputProps } from 'react-native';
import Theme from '../../constants/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

const Input = ({ label, error, style, ...props }: InputProps) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[styles.input, error ? styles.inputError : undefined, style]}
                placeholderTextColor={Theme.colors.textSecondary}
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Theme.spacing.md,
    },
    label: {
        fontSize: Theme.typography.fontSizeSM,
        color: Theme.colors.textPrimary,
        marginBottom: Theme.spacing.xs,
        fontWeight: '500',
    },
    input: {
        backgroundColor: Theme.colors.surface,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderRadius: Theme.borderRadius.md,
        padding: Theme.spacing.md,
        fontSize: Theme.typography.fontSizeMD,
        color: Theme.colors.textPrimary,
    },
    inputError: {
        borderColor: Theme.colors.danger,
    },
    error: {
        color: Theme.colors.danger,
        fontSize: Theme.typography.fontSizeXS,
        marginTop: Theme.spacing.xs,
    },
});

export default Input;
