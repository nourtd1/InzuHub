import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { useTranslation, LANGUAGES, changeLanguage, LanguageCode } from '../../i18n/useTranslation';
import { COLORS } from '../../constants/theme';
import Toast from 'react-native-toast-message';

const { height } = Dimensions.get('window');

interface LanguageSelectorProps {
    onClose?: () => void;
    visible?: boolean;
}

export default function LanguageSelector({ onClose, visible = true }: LanguageSelectorProps) {
    const { t, i18n } = useTranslation();
    const currentLangCode = i18n.language;

    const handleLanguageChange = async (code: LanguageCode) => {
        await changeLanguage(code);
        Toast.show({
            type: 'success',
            text1: Object.values(i18n.store.data[code]?.translation?.language || {}).includes('changed')
                ? (i18n.store.data[code]?.translation as any)?.language?.changed
                : 'Language changed successfully',
            visibilityTime: 1500,
        });
        if (onClose) onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity style={styles.container} activeOpacity={1}>
                    <Text style={styles.title}>{t('language.select_title')}</Text>
                    <Text style={styles.subtitle}>{t('language.select_subtitle')}</Text>

                    <View style={styles.list}>
                        {LANGUAGES.map((lang) => {
                            const isActive = lang.code === currentLangCode;
                            return (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[styles.item, isActive && styles.itemActive]}
                                    onPress={() => handleLanguageChange(lang.code as LanguageCode)}
                                >
                                    <Text style={styles.flag}>{lang.flag}</Text>
                                    <View style={styles.textContainer}>
                                        <Text style={[styles.nativeLabel, isActive && styles.textActive]}>
                                            {lang.nativeLabel}
                                        </Text>
                                        <Text style={styles.currentLabel}>
                                            {t(`language.${lang.code}`)}
                                        </Text>
                                    </View>
                                    {isActive && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
        maxHeight: height * 0.8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    list: {
        gap: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
    },
    itemActive: {
        backgroundColor: `${COLORS.primary}1A`, // 10% opacity
    },
    flag: {
        fontSize: 36,
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    nativeLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    currentLabel: {
        fontSize: 14,
        color: '#666',
    },
    textActive: {
        color: COLORS.primary,
    },
    checkmark: {
        fontSize: 20,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
