import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/theme';

interface DayCardProps {
    date: Date;
    isSelected: boolean;
    isToday: boolean;
    isSunday: boolean;
    onPress: () => void;
}

export default function DayCard({ date, isSelected, isToday, isSunday, onPress }: DayCardProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        if (!isSunday) {
            Animated.spring(scale, {
                toValue: 0.95,
                useNativeDriver: true,
            }).start();
        }
    };

    const handlePressOut = () => {
        if (!isSunday) {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    };

    const animatedStyle = {
        transform: [{ scale }]
    };

    const jourAbr = format(date, 'EEE', { locale: fr });
    const numero = format(date, 'd');
    const moisAbr = format(date, 'MMM', { locale: fr });

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={isSunday ? undefined : onPress}
            onPressIn={isSunday ? undefined : handlePressIn}
            onPressOut={isSunday ? undefined : handlePressOut}
            disabled={isSunday}
        >
            <Animated.View style={[
                styles.card,
                isToday && styles.cardToday,
                isSelected && styles.cardSelected,
                isSunday && styles.cardSunday,
                animatedStyle
            ]}>
                <Text style={[styles.jourText, isSelected && styles.textBlanc, isSunday && styles.textSunday]} numberOfLines={1}>{jourAbr}</Text>
                <Text style={[styles.numeroText, isSelected && styles.textBlanc, isSunday && styles.textSunday]}>{numero}</Text>
                <Text style={[styles.moisText, isSelected && styles.textBlanc, isSunday && styles.textSunday]} numberOfLines={1}>{moisAbr}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 64,
        height: 80,
        marginRight: 8,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    cardToday: {
        borderColor: COLORS.primary,
    },
    cardSunday: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.border,
        opacity: 0.6,
    },
    jourText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    numeroText: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginVertical: 2,
    },
    moisText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textTransform: 'capitalize',
    },
    textBlanc: {
        color: COLORS.surface,
    },
    textSunday: {
        color: COLORS.textSecondary,
    }
});
