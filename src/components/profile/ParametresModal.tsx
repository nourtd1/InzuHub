import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Alert, Linking, Dimensions } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { profileService } from '../../services/profileService';
import { supabase } from '../../lib/supabase';
import LanguageSelector from '../ui/LanguageSelector';
import { useTranslation, LANGUAGES } from '../../i18n/useTranslation';

const { height } = Dimensions.get('window');

interface ParametresModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ParametresModal({ visible, onClose }: ParametresModalProps) {
    const { user, signOut } = useAuth();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [themeDark, setThemeDark] = useState(false);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const { t, i18n } = useTranslation();
    const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

    const handleResetPassword = () => {
        if (!user?.email) return;
        Alert.alert(
            "Réinitialiser le mot de passe",
            "Un email de réinitialisation sera envoyé à votre adresse InzuHub.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Envoyer l'email",
                    onPress: async () => {
                        await supabase.auth.resetPasswordForEmail(user.email!);
                        Alert.alert("Envoyé", "Vérifiez votre boîte mail.");
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Zone de danger",
            "Êtes-vous sûr ? Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Continuer",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert(
                            "Dernière confirmation",
                            "Toutes vos données seront supprimées définitivement.",
                            [
                                { text: "Annuler", style: "cancel" },
                                {
                                    text: "Oui, supprimer mon compte",
                                    style: "destructive",
                                    onPress: async () => {
                                        try {
                                            await profileService.deleteAccount(user!.id);
                                            await signOut();
                                            onClose();
                                        } catch (e) {
                                            Alert.alert("Erreur", "Impossible de supprimer le compte");
                                        }
                                    }
                                }
                            ]
                        );
                    }
                }
            ]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Paramètres</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <MaterialIcons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        {/* Section Compte */}
                        <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>

                        <View style={styles.itemRow}>
                            <View style={styles.itemLeft}>
                                <MaterialIcons name="notifications" size={24} color={COLORS.primary} style={styles.itemIcon} />
                                <Text style={styles.itemLabel}>{t('profile.notifications')}</Text>
                            </View>
                            <Switch
                                value={pushEnabled}
                                onValueChange={setPushEnabled}
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        </View>
                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.itemRow} onPress={() => setLanguageModalVisible(true)}>
                            <View style={styles.itemLeft}>
                                <Ionicons name="earth" size={24} color={COLORS.primary} style={styles.itemIcon} />
                                <Text style={styles.itemLabel}>{t('profile.language')}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: COLORS.textSecondary, marginRight: 8 }}>
                                    {currentLang.flag} {currentLang.nativeLabel}
                                </Text>
                                <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.divider} />

                        <View style={styles.itemRow}>
                            <View style={styles.itemLeft}>
                                <MaterialIcons name="dark-mode" size={24} color={COLORS.primary} style={styles.itemIcon} />
                                <View>
                                    <Text style={styles.itemLabel}>{t('profile.dark_mode')}</Text>
                                    <Text style={styles.subLabel}>{t('common.soon')}</Text>
                                </View>
                            </View>
                            <Switch
                                value={themeDark}
                                onValueChange={() => { }}
                                disabled
                                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                            />
                        </View>

                        {/* Section Sécurité */}
                        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Sécurité</Text>

                        <TouchableOpacity style={styles.itemRow} onPress={handleResetPassword}>
                            <View style={styles.itemLeft}>
                                <MaterialIcons name="lock-reset" size={24} color={COLORS.primary} style={styles.itemIcon} />
                                <Text style={styles.itemLabel}>{t('profile.change_password')}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        {/* Section Légal */}
                        <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Légal</Text>

                        <TouchableOpacity style={styles.itemRow} onPress={() => Linking.openURL('https://example.com/cgu')}>
                            <View style={styles.itemLeft}>
                                <MaterialIcons name="description" size={24} color={COLORS.primary} style={styles.itemIcon} />
                                <Text style={styles.itemLabel}>{t('profile.terms')}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                        <View style={styles.divider} />

                        <TouchableOpacity style={styles.itemRow} onPress={() => Linking.openURL('https://www.privacypolicies.com/live/7ffeaaff-93c3-49e8-95b3-c0ad146864a4')}>
                            <View style={styles.itemLeft}>
                                <MaterialIcons name="privacy-tip" size={24} color={COLORS.primary} style={styles.itemIcon} />
                                <Text style={styles.itemLabel}>{t('profile.privacy')}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
                        </TouchableOpacity>

                        {/* Danger Zone */}
                        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg, color: COLORS.danger }]}>Danger Zone</Text>

                        <TouchableOpacity style={styles.itemRow} onPress={handleDeleteAccount}>
                            <View style={styles.itemLeft}>
                                <MaterialIcons name="delete-forever" size={24} color={COLORS.danger} style={styles.itemIcon} />
                                <Text style={[styles.itemLabel, { color: COLORS.danger }]}>{t('profile.delete_account')}</Text>
                            </View>
                        </TouchableOpacity>

                    </ScrollView>
                    <LanguageSelector
                        visible={languageModalVisible}
                        onClose={() => setLanguageModalVisible(false)}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        height: height * 0.85,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    closeBtn: {
        position: 'absolute',
        right: SPACING.md,
        padding: SPACING.xs,
    },
    content: {
        padding: SPACING.md,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
        textTransform: 'uppercase',
        marginBottom: SPACING.sm,
        marginLeft: SPACING.xs,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: SPACING.sm,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemIcon: {
        marginRight: SPACING.md,
    },
    itemLabel: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    subLabel: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.secondary,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.sm,
    }
});
