import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateSeparatorProps {
    dateString: string;
}

export default function DateSeparator({ dateString }: DateSeparatorProps) {
    const date = new Date(dateString);
    let label = '';

    if (isToday(date)) {
        label = "Aujourd'hui";
    } else if (isYesterday(date)) {
        label = 'Hier';
    } else if (isThisWeek(date)) {
        label = format(date, 'eee d MMM', { locale: fr });
    } else {
        label = format(date, 'd MMM yyyy', { locale: fr });
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
        marginVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
    },
    line: {
        flex: 1,
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.background, // Match container bg so it acts as mask
    }
});
