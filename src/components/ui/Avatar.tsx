import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Image } from 'expo-image';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';
import { getPublicUrl } from '../../lib/supabase';

interface AvatarProps {
    uri?: string | null;
    name: string;
    size: number;
    backgroundColor?: string;
    style?: ViewStyle;
    isVerified?: boolean;
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

export default function Avatar({ uri, name, size, backgroundColor, style, isVerified }: AvatarProps) {
    const bgColor = useMemo(() => backgroundColor || generateColorFromName(name), [name, backgroundColor]);
    const initials = useMemo(() => getInitials(name), [name]);

    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
    };

    const textStyle: TextStyle = {
        fontSize: size * 0.4,
        fontWeight: '600',
        color: COLORS.textPrimary,
    };

    return (
        <View style={[{ width: size, height: size }, style]}>
            <View style={[containerStyle, { overflow: 'hidden' }]}>
                {uri ? (
                    <Image
                        source={{ uri: getPublicUrl(uri, 'avatars') }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <Text style={textStyle} allowFontScaling={false}>{initials}</Text>
                )}
            </View>

            {isVerified && (
                <View style={[
                    styles.verifiedBadge,
                    {
                        bottom: 0,
                        right: 0,
                        width: size * 0.3,
                        height: size * 0.3,
                        borderRadius: (size * 0.3) / 2
                    }
                ]}>
                    <Text style={[styles.verifiedCheck, { fontSize: size * 0.18 }]}>✓</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    verifiedBadge: {
        position: 'absolute',
        backgroundColor: COLORS.secondary,
        borderWidth: 2,
        borderColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedCheck: {
        color: COLORS.surface,
        fontWeight: 'bold',
    }
});
