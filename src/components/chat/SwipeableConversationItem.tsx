import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { useTranslation } from 'react-i18next';

interface SwipeableConversationItemProps {
    children: React.ReactNode;
    onDelete: () => void;
}

export default function SwipeableConversationItem({ children, onDelete }: SwipeableConversationItemProps) {
    const { t } = useTranslation();
    const swipeableRef = useRef<Swipeable>(null);

    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
    ) => {
        const trans = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => {
                    swipeableRef.current?.close();
                    Alert.alert(
                        t('chat.delete_title'),
                        t('chat.delete_message'),
                        [
                            { text: t('common.cancel'), style: 'cancel' },
                            {
                                text: t('common.delete'),
                                style: 'destructive',
                                onPress: onDelete
                            }
                        ]
                    );
                }}
                activeOpacity={0.8}
            >
                <Animated.View style={{ transform: [{ scale: trans }] }}>
                    <MaterialIcons name="delete-outline" size={24} color={COLORS.surface} />
                    <Text style={styles.deleteText}>{t('common.delete')}</Text>
                </Animated.View>
            </TouchableOpacity>
        );
    };

    return (
        <Swipeable
            ref={swipeableRef}
            renderRightActions={renderRightActions}
            friction={2}
            rightThreshold={40}
        >
            {children}
        </Swipeable>
    );
}

const styles = StyleSheet.create({
    deleteAction: {
        backgroundColor: COLORS.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteText: {
        color: COLORS.surface,
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    },
});
