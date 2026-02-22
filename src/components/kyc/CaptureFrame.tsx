import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Animated } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import CaptureOptions from './CaptureOptions';

interface CaptureFrameProps {
    type: 'card' | 'selfie';
    hasPhoto: boolean;
    photoUri: string | null;
    onCapture: (uri: string) => void;
    onRetake: () => void;
}

export default function CaptureFrame({ type, hasPhoto, photoUri, onCapture, onRetake }: CaptureFrameProps) {
    const isCard = type === 'card';
    const pulseAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (!hasPhoto) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1); // Reset
            pulseAnim.stopAnimation();
        }
    }, [hasPhoto]);

    if (hasPhoto && photoUri) {
        return (
            <View style={styles.container}>
                <Image source={{ uri: photoUri }} style={[styles.imagePreview, isCard ? styles.cardSize : styles.selfieSize]} />
                <View style={styles.successBadge}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.surface} style={{ marginRight: 4 }} />
                    <Text style={styles.successText}>Photo capturée</Text>
                </View>
                <TouchableOpacity style={styles.retakeBtn} onPress={onRetake}>
                    <MaterialIcons name="refresh" size={18} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
                    <Text style={styles.retakeText}>Reprendre la photo</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[
                styles.frame,
                isCard ? styles.cardSize : styles.selfieSize,
                { opacity: pulseAnim },
                !isCard && { borderRadius: 100, borderStyle: 'dotted' } // oval like for selfie
            ]}>

                {isCard && (
                    <>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                    </>
                )}

                <MaterialIcons name={isCard ? 'badge' : 'face'} size={48} color={COLORS.textSecondary} style={{ opacity: 0.5, marginBottom: 8 }} />
                <Text style={styles.frameLabel}>
                    {isCard ? "Carte d'identité rwandaise\nFormat : 85.6 x 54 mm" : "Tenez votre carte à côté\nde votre visage"}
                </Text>

            </Animated.View>

            <CaptureOptions type={type} onCapture={onCapture} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: SPACING.md,
    },
    frame: {
        borderWidth: 2,
        borderColor: COLORS.primary,
        borderStyle: 'dashed',
        borderRadius: BORDER_RADIUS.md,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: `${COLORS.primary}05`,
        marginBottom: 20,
        position: 'relative',
    },
    cardSize: {
        width: 342,  // 8.56 ratio x40
        height: 216, // 5.4 ratio x40
    },
    selfieSize: {
        width: 250,
        height: 350,
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: COLORS.primary,
    },
    tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: BORDER_RADIUS.md },
    tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: BORDER_RADIUS.md },
    bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: BORDER_RADIUS.md },
    br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: BORDER_RADIUS.md },
    frameLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
    },
    imagePreview: {
        borderRadius: BORDER_RADIUS.md,
        objectFit: 'cover',
        marginBottom: SPACING.md,
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: SPACING.lg,
    },
    successText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: 'bold',
    },
    retakeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.md,
    },
    retakeText: {
        color: COLORS.textPrimary,
        fontWeight: 'bold',
    }
});
