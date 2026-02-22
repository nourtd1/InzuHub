import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { LocalPhoto } from '../../store/PostPropertyStore';
import PhotoThumbnail from './PhotoThumbnail';
import { COLORS, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface PhotoGridProps {
    photos: LocalPhoto[];
    onRemove: (id: string) => void;
    onSetMain: (id: string) => void;
    onAddPhoto: () => void;
}

export default function PhotoGrid({ photos, onRemove, onSetMain, onAddPhoto }: PhotoGridProps) {
    if (photos.length === 0) return null;

    return (
        <View style={styles.gridContainer}>
            {photos.map((photo, index) => (
                <View key={photo.id} style={[styles.itemWrapper, index === 0 ? styles.mainItemWrapper : styles.subItemWrapper]}>
                    <PhotoThumbnail
                        photo={photo}
                        isMain={photo.isMain || index === 0}
                        size={index === 0 ? 'large' : 'small'}
                        onRemove={() => onRemove(photo.id)}
                        onSetMain={() => onSetMain(photo.id)}
                    />
                </View>
            ))}

            {photos.length < 8 && (
                <TouchableOpacity style={styles.addBtnContainer} onPress={onAddPhoto}>
                    <MaterialIcons name="add" size={32} color={COLORS.textSecondary} />
                </TouchableOpacity>
            )}

            <View style={styles.counterContainer}>
                <Text style={[styles.counterText, photos.length < 3 ? { color: COLORS.danger } : { color: COLORS.secondary }]}>
                    {photos.length}/8 photos • 3 minimum requis
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
        marginBottom: SPACING.md,
    },
    itemWrapper: {
        marginBottom: SPACING.xs,
    },
    mainItemWrapper: {
        width: '65.5%',
        aspectRatio: 1,
    },
    subItemWrapper: {
        width: '32%',
        aspectRatio: 1,
    },
    addBtnContainer: {
        width: '32%',
        aspectRatio: 1,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    counterContainer: {
        width: '100%',
        marginTop: SPACING.sm,
    },
    counterText: {
        fontSize: 12,
        textAlign: 'center',
        fontWeight: 'bold',
    }
});
