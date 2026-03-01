import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface ChatInputBarProps {
    onSend: (text: string) => void;
    onTyping: () => void;
    onScheduleVisit: () => void;
    isSending: boolean;
    canSchedule?: boolean;
}

export default function ChatInputBar({
    onSend,
    onTyping,
    onScheduleVisit,
    isSending,
    canSchedule = true
}: ChatInputBarProps) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const inputRef = useRef<TextInput>(null);

    const handleSend = () => {
        if (text.trim()) {
            onSend(text);
            setText('');
            Keyboard.dismiss();
        }
    };

    const handleChangeText = (val: string) => {
        setText(val);
        if (val.length > 0) onTyping();
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputWrapper}>
                {canSchedule && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={onScheduleVisit}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="event" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                )}

                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={t('chat.type_message')}
                    placeholderTextColor={COLORS.textSecondary}
                    value={text}
                    onChangeText={handleChangeText}
                    multiline
                    maxLength={1000}
                />

                <TouchableOpacity
                    style={[styles.sendButton, (!text.trim() || isSending) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!text.trim() || isSending}
                >
                    <MaterialIcons name="send" size={24} color={COLORS.surface} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.xl,
        paddingHorizontal: SPACING.xs,
        paddingVertical: 4,
        minHeight: 44,
    },
    actionButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        paddingVertical: 8,
        paddingHorizontal: SPACING.sm,
        maxHeight: 120,
    },
    sendButton: {
        backgroundColor: COLORS.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
        marginRight: 2,
    },
    sendButtonDisabled: {
        backgroundColor: COLORS.textSecondary,
        opacity: 0.5,
    },
});
