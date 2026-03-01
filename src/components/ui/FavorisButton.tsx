import React, { useRef } from 'react';
import { View, Animated, TouchableWithoutFeedback, StyleSheet, ViewStyle, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useFavoris } from '../../store/FavorisContext';
import { useToast } from '../../store/ToastContext';
import { useTranslation } from '../../i18n/useTranslation';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/theme';

interface FavorisButtonProps {
    propertyId: string;
    size?: 'sm' | 'md' | 'lg';
    style?: ViewStyle;
}

const FavorisButton: React.FC<FavorisButtonProps> = ({ propertyId, size = 'sm', style }) => {
    const { isAuthenticated } = useAuth();
    const { isFavori, toggleFavori } = useFavoris();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const router = useRouter();

    const scale = useRef(new Animated.Value(1)).current;

    // Determine context safely, fallback to hooks properly
    const favori = isFavori ? isFavori(propertyId) : false;

    const getIconSize = () => {
        switch (size) {
            case 'sm': return 20;
            case 'md': return 26;
            case 'lg': return 32;
        }
    };

    const handlePress = async () => {
        if (!isAuthenticated) {
            Alert.alert(
                t('favorites.login_required_title'),
                t('favorites.login_required_message'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    { text: t('auth.login_button'), onPress: () => router.push('/(auth)/login') }
                ]
            );
            return;
        }

        // Animation bounce
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1.4,
                useNativeDriver: true,
                speed: 20,
            }),
            Animated.spring(scale, {
                toValue: 1.0,
                useNativeDriver: true,
                speed: 20,
            })
        ]).start();

        const wasFavori = favori;

        try {
            if (toggleFavori) {
                await toggleFavori(propertyId);
            }
            if (!wasFavori) {
                showToast({ message: t('favorites.added'), type: 'info' });
            } else {
                showToast({ message: t('favorites.removed'), type: 'info' });
            }
        } catch (error) {
            showToast({ message: t('common.error'), type: 'error' });
        }
    };

    const iconSize = getIconSize();
    const containerSize = iconSize + 12;

    return (
        <TouchableWithoutFeedback onPress={handlePress}>
            <Animated.View style={[
                styles.container,
                { width: containerSize, height: containerSize, borderRadius: containerSize / 2 },
                { transform: [{ scale }] },
                style
            ]}>
                <Ionicons
                    name={favori ? 'heart' : 'heart-outline'}
                    size={iconSize}
                    color={favori ? COLORS.danger : '#FFFFFF'}
                    style={styles.icon}
                />
            </Animated.View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        // center tweak if needed based on font
        marginTop: 1,
    }
});

export default FavorisButton;
