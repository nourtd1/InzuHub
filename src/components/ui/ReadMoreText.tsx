import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../../constants/theme';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

interface ReadMoreTextProps {
    text: string;
    numberOfLines?: number;
}

export default function ReadMoreText({ text, numberOfLines = 3 }: ReadMoreTextProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const toggleExpansion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleTextLayout = (e: any) => {
        if (!hasMore && e.nativeEvent.lines.length > numberOfLines) {
            setHasMore(true);
        }
    };

    return (
        <View style={styles.container}>
            <Text
                style={styles.text}
                numberOfLines={isExpanded ? undefined : numberOfLines}
                onTextLayout={handleTextLayout}
            >
                {text}
            </Text>
            {hasMore && (
                <TouchableOpacity onPress={toggleExpansion} style={styles.button}>
                    <Text style={styles.buttonText}>{isExpanded ? 'Réduire ' : 'Lire plus '}</Text>
                    <MaterialIcons
                        name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={16}
                        color={COLORS.primary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.md,
    },
    text: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    buttonText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.primary,
        fontWeight: '600',
    },
});
