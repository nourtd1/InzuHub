import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ChatInputProps {
    onSend: (text: string) => void;
    isSending: boolean;
}

export default function ChatInput({ onSend, isSending }: ChatInputProps) {
    const [text, setText] = useState('');

    const handleSend = () => {
        if (text.trim() && !isSending) {
            onSend(text.trim());
            setText('');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.keyboardContainer}
        >
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Écrivez un message..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={text}
                        onChangeText={setText}
                        multiline
                        maxLength={1000}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, (!text.trim() || isSending) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!text.trim() || isSending}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color={COLORS.surface} />
                    ) : (
                        <MaterialIcons name="send" size={20} color={COLORS.surface} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        backgroundColor: COLORS.surface,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: SPACING.md,
        paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    inputContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.lg,
        minHeight: 40,
        maxHeight: 120, // Prevents input from growing too large
        paddingHorizontal: SPACING.md,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        marginRight: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        paddingTop: 0,
        paddingBottom: 0,
        textAlignVertical: 'center', // Fix Android vertical align
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: `${COLORS.primary}80`, // Transparent 50%
    },
});
