import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface ChatInputBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onPressVisite: () => void;
    isSending: boolean;
    canProposeVisite: boolean;
    visiteStatus?: 'proposee' | 'confirmee' | 'annulee' | null;
}

export default function ChatInputBar({
    value,
    onChangeText,
    onSend,
    onPressVisite,
    isSending,
    canProposeVisite,
    visiteStatus
}: ChatInputBarProps) {
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        if (value.trim() && !isSending) {
            onSend();
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={styles.keyboardContainer}
        >
            <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
                {canProposeVisite && visiteStatus === 'confirmee' && (
                    <View style={styles.visitConfirmedBadge}>
                        <Text style={styles.visitConfirmedText}>✅ Visite confirmée</Text>
                    </View>
                )}
                {canProposeVisite && visiteStatus !== 'confirmee' && (
                    <TouchableOpacity
                        style={[styles.visitButton, visiteStatus === 'proposee' && styles.visitButtonDisabled]}
                        onPress={() => {
                            if (visiteStatus === 'proposee') {
                                Alert.alert("Information", "Une visite est déjà en attente de confirmation.");
                            } else {
                                onPressVisite();
                            }
                        }}
                    >
                        <MaterialIcons
                            name="event"
                            size={24}
                            color={visiteStatus === 'proposee' ? COLORS.textSecondary : COLORS.primary}
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.input, { maxHeight: 120 }]}
                        placeholder="Votre message..."
                        placeholderTextColor={COLORS.textSecondary}
                        value={value}
                        onChangeText={onChangeText}
                        multiline
                        returnKeyType={Platform.OS === 'ios' ? 'send' : 'default'}
                        blurOnSubmit={false}
                        maxLength={1000}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.sendButton, (!value.trim() || isSending) && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!value.trim() || isSending}
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
        backgroundColor: COLORS.surface,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: COLORS.border,
    },
    visitButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: `${COLORS.primary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
        marginBottom: Platform.OS === 'ios' ? 0 : 2, // Align with input
    },
    visitButtonDisabled: {
        backgroundColor: COLORS.background,
    },
    visitConfirmedBadge: {
        height: 40,
        paddingHorizontal: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        backgroundColor: `${COLORS.secondary}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
        marginBottom: Platform.OS === 'ios' ? 0 : 2,
    },
    visitConfirmedText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.secondary,
        fontWeight: 'bold',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.xl,
        minHeight: 40,
        paddingHorizontal: SPACING.md,
        paddingVertical: Platform.OS === 'ios' ? 10 : 8,
        marginRight: SPACING.sm,
    },
    input: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        paddingTop: 0,
        paddingBottom: 0,
        textAlignVertical: 'center',
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Platform.OS === 'ios' ? 0 : 2,
    },
    sendButtonDisabled: {
        opacity: 0.4,
        backgroundColor: COLORS.textSecondary,
    },
});
