import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Animated,
    Platform,
    ActivityIndicator
} from 'react-native';
import { COLORS } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface ChatInputBarProps {
    onSend: (text: string) => void;
    onOpenVisitePlanner: () => void;
    isSending: boolean;
    onTyping: () => void;
    bottomInset: number;
    canSchedule?: boolean;
}

export default function ChatInputBar({
    onSend,
    onOpenVisitePlanner,
    isSending,
    onTyping,
    bottomInset,
    canSchedule = true
}: ChatInputBarProps) {
    const { t } = useTranslation();
    const [text, setText] = useState('');
    const [inputHeight, setInputHeight] = useState(44);
    const [isFocused, setIsFocused] = useState(false);

    // Animation scale pour le bouton envoyer
    const sendScale = useRef(new Animated.Value(1)).current;

    const canSend = text.trim().length > 0 && !isSending;

    const animateSend = () => {
        Animated.sequence([
            Animated.spring(sendScale, {
                toValue: 0.85,
                useNativeDriver: true,
                speed: 50,
            }),
            Animated.spring(sendScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 20,
            }),
        ]).start();
    };

    const handleSend = () => {
        if (!canSend) return;
        animateSend();
        onSend(text.trim());
        setText('');
        setInputHeight(44);
    };

    const borderColor = isFocused || text.length > 0
        ? COLORS.primary
        : COLORS.border;

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: Math.max(bottomInset, Platform.OS === 'android' ? 8 : 12),
                }
            ]}
        >
            <View style={styles.content}>
                {/* Bouton 📅 Proposer une visite */}
                {canSchedule && (
                    <TouchableOpacity
                        onPress={onOpenVisitePlanner}
                        style={styles.calendarButton}
                        activeOpacity={0.7}
                    >
                        <Text style={{ fontSize: 20 }}>📅</Text>
                    </TouchableOpacity>
                )}

                {/* Zone de saisie */}
                <View
                    style={[
                        styles.inputContainer,
                        { borderColor: borderColor }
                    ]}
                >
                    <TextInput
                        value={text}
                        onChangeText={(val) => {
                            setText(val);
                            onTyping();
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={t('chat.type_message')}
                        placeholderTextColor={COLORS.textSecondary}
                        multiline
                        scrollEnabled
                        style={[
                            styles.input,
                            {
                                height: Math.min(Math.max(44, inputHeight), 120),
                            }
                        ]}
                        onContentSizeChange={(e) => {
                            setInputHeight(e.nativeEvent.contentSize.height);
                        }}
                        returnKeyType="default"
                        blurOnSubmit={false}
                        textAlignVertical="center"
                    />
                </View>

                {/* Bouton Envoyer */}
                <Animated.View style={{ transform: [{ scale: sendScale }] }}>
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!canSend}
                        style={[
                            styles.sendButton,
                            { backgroundColor: canSend ? COLORS.primary : COLORS.border }
                        ]}
                        activeOpacity={0.8}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={[
                                styles.sendIcon,
                                { color: canSend ? '#FFFFFF' : COLORS.textSecondary }
                            ]}>
                                ➤
                            </Text>
                        )}
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: 10,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    calendarButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    inputContainer: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        backgroundColor: COLORS.background,
        borderRadius: 22,
        borderWidth: 1.5,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 11 : 8,
        justifyContent: 'center',
    },
    input: {
        fontSize: 16,
        lineHeight: 22,
        color: COLORS.textPrimary,
        paddingTop: 0,
        paddingBottom: 0,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
