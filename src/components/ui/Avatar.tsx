import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';

interface AvatarProps {
    uri?: string | null;
    name: string;
    size: number;
    backgroundColor?: string;
    style?: ViewStyle;
}

// Generate a deterministic color based on the name string
const generateColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    // Return an HSL color for good contrast and saturation
    return `hsl(${h}, 60%, 80%)`;
};

// Get uppercase initials
const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export default function Avatar({ uri, name, size, backgroundColor, style }: AvatarProps) {
    const bgColor = useMemo(() => backgroundColor || generateColorFromName(name), [name, backgroundColor]);
    const initials = useMemo(() => getInitials(name), [name]);

    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Ensures Image stays within radius
    };

    const textStyle: TextStyle = {
        fontSize: size * 0.4,
        fontWeight: '600',
        color: COLORS.textPrimary, // With hsl(h, 60%, 80%) dark text is usually readable
    };

    if (uri) {
        return (
            <View style={[containerStyle, style]}>
                <Image
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                    transition={200}
                />
            </View>
        );
    }

    return (
        <View style={[containerStyle, style]}>
            <Text style={textStyle} allowFontScaling={false}>{initials}</Text>
        </View>
    );
}
