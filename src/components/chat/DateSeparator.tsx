import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { useTranslation } from 'react-i18next';
import { isToday, isYesterday, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateSeparatorProps {
    date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
    const { t } = useTranslation();
    const d = new Date(date);

    let label = '';
    if (isToday(d)) {
        label = t('chat.today');
    } else if (isYesterday(d)) {
        label = t('chat.yesterday');
    } else {
        label = format(d, 'EEEE d MMMM', { locale: fr });
    }

    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <Text style={styles.text}>{label}</Text>
            <View style={styles.line} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.xl,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    text: {
        paddingHorizontal: SPACING.md,
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
