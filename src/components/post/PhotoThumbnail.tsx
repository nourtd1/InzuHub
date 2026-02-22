import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LocalPhoto } from '../../store/PostPropertyStore';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface PhotoThumbnailProps {
    photo: LocalPhoto;
    isMain: boolean;
    size: 'large' | 'small';
    onRemove: () => void;
    onSetMain: () => void;
}

export default function PhotoThumbnail({ photo, isMain, size, onRemove, onSetMain }: PhotoThumbnailProps) {
    const isLarge = size === 'large';

    return (
        <TouchableOpacity
            style={[styles.container, isLarge ? styles.largeContainer : styles.smallContainer]}
            onPress={onSetMain}
            delayLongPress={200} // Setup for drag 'n drop if attached
        >
            <Image
                source={{ uri: photo.uri }}
                style={styles.image}
            />

            {/* Remove button */}
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
                <MaterialIcons name="close" size={16} color={COLORS.textPrimary} />
            </TouchableOpacity>

            {/* State indicators */}
            {photo.isUploading && (
                <View style={styles.uploadOverlay}>
                    <ActivityIndicator size="small" color={COLORS.surface} />
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${photo.uploadProgress || 0}%` }]} />
                    </View>
                </View>
            )}

            {!photo.isUploading && photo.uploadedUrl && !photo.uploadError && (
                <View style={styles.successBadge}>
                    <MaterialIcons name="check-circle" size={18} color={COLORS.secondary} />
                </View>
            )}

            {photo.uploadError && (
                <View style={[styles.uploadOverlay, { backgroundColor: `${COLORS.danger}33` }]}>
                    <MaterialIcons name="error" size={24} color={COLORS.danger} style={{ backgroundColor: 'white', borderRadius: 12 }} />
                    <Text style={styles.errorText}>Tap pour réessayer</Text>
                </View>
            )}

            {/* Main Badge */}
            {isMain && (
                <View style={styles.mainBadge}>
                    <Text style={styles.mainBadgeText}>⭐ Principale</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    largeContainer: {
        width: '64%', // Occupy 2 columns roughly of a 3 col layout
        aspectRatio: 1,
    },
    smallContainer: {
        width: '32%',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    removeBtn: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 12,
        padding: 4,
        zIndex: 10,
    },
    uploadOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5,
    },
    progressBarBg: {
        width: '60%',
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        marginTop: 12,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.surface,
    },
    successBadge: {
        position: 'absolute',
        bottom: 6,
        right: 6,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 2,
    },
    errorText: {
        color: COLORS.surface,
        fontSize: 10,
        marginTop: 4,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    mainBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: `${COLORS.primary}CC`,
        paddingVertical: 6,
        alignItems: 'center',
    },
    mainBadgeText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: 'bold',
    }
});
