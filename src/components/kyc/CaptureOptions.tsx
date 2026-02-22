import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import * as ImagePicker from 'expo-image-picker';

interface CaptureOptionsProps {
    type: 'card' | 'selfie';
    onCapture: (uri: string) => void;
}

export default function CaptureOptions({ type, onCapture }: CaptureOptionsProps) {

    const handleCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission refusée',
                "InzuHub a besoin d'accéder à votre appareil photo pour la vérification d'identité.",
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Paramètres', onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        const aspect: [number, number] = type === 'card' ? [8.56, 5.4] : [1, 1];

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                quality: 0.9,
                allowsEditing: true,
                aspect,
                cameraType: type === 'selfie' ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onCapture(result.assets[0].uri);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission refusée',
                "InzuHub a besoin de lire vos photos.",
                [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Paramètres', onPress: () => Linking.openSettings() }
                ]
            );
            return;
        }

        const aspect: [number, number] = type === 'card' ? [8.56, 5.4] : [1, 1];

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.9,
                allowsEditing: true,
                aspect,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                onCapture(result.assets[0].uri);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.btnCamera} onPress={handleCamera}>
                <MaterialIcons name="camera-alt" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />
                <Text style={styles.btnCameraText}>Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnGallery} onPress={handleGallery}>
                <MaterialIcons name="photo-library" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.btnGalleryText}>Choisir depuis la galerie</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: SPACING.md,
    },
    btnCamera: {
        flexDirection: 'row',
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.md,
    },
    btnCameraText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    },
    btnGallery: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: BORDER_RADIUS.md,
    },
    btnGalleryText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    }
});
