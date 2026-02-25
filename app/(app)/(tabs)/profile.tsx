import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, Linking } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../../src/constants/theme';
import { useAuth } from '../../../src/hooks/useAuth';
import { useProfile } from '../../../src/hooks/useProfile';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../../../src/components/ui/Avatar';
import TrustBadge from '../../../src/components/profile/TrustBadge';
import StatsGrid from '../../../src/components/profile/StatsGrid';
import MyPropertiesSection from '../../../src/components/profile/MyPropertiesSection';
import MyVisitsSection from '../../../src/components/profile/MyVisitsSection';
import ParametresModal from '../../../src/components/profile/ParametresModal';
import EditProfileModal from '../../../src/components/profile/EditProfileModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '../../../src/i18n/useTranslation';

export default function ProfileScreen() {
    const { signOut } = useAuth();
    const {
        profile,
        stats,
        myProperties,
        myVisits,
        isLoading,
        isUploadingAvatar,
        isUpdatingProfile,
        uploadAvatar,
        updateProfile,
        updatePropertyStatus,
        deleteProperty
    } = useProfile();

    const { t } = useTranslation();
    const [isParametresVisible, setIsParametresVisible] = useState(false);
    const [isEditVisible, setIsEditVisible] = useState(false);

    if (isLoading || !profile) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    const handleChangeAvatar = () => {
        Alert.alert(
            t('common.verify') === 'Vérifier' ? 'Modifier ma photo' : t('common.edit'), // Using fallback or common since profile.avatar isn't directly there
            t('kyc.choose_gallery') === 'Choisir depuis la galerie' ? 'Choisissez une option' : t('common.choose_option', { defaultValue: 'Choisissez une option' }),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('kyc.choose_gallery'),
                    onPress: async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ['images'],
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            uploadAvatar(result.assets[0].uri);
                        }
                    }
                },
                {
                    text: t('kyc.take_photo'),
                    onPress: async () => {
                        const result = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.8,
                        });
                        if (!result.canceled) {
                            uploadAvatar(result.assets[0].uri);
                        }
                    }
                }
            ]
        );
    };

    const handleShare = () => {
        Share.share({
            message: t('profile.share_app_text')
        });
    };

    const handleLogout = () => {
        Alert.alert(
            t('auth.logout_confirm_title'),
            t('auth.logout_confirm_message'),
            [
                { text: t('common.cancel'), style: "cancel" },
                {
                    text: t('auth.logout'),
                    style: "destructive",
                    onPress: () => signOut()
                }
            ]
        );
    };

    const roleLabel = profile.role === 'proprietaire' ? `🏠 ${t('auth.role_owner')}` : profile.role === 'locataire' ? `🔍 ${t('auth.role_tenant')}` : '⚙ Administrateur';
    const roleColor = profile.role === 'proprietaire' ? COLORS.primary : profile.role === 'locataire' ? COLORS.secondary : COLORS.danger;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('profile.title')}</Text>
                <TouchableOpacity onPress={() => setIsParametresVisible(true)} style={styles.settingsBtn}>
                    <MaterialIcons name="settings" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Hero Profil */}
                <LinearGradient colors={[`${COLORS.primary}0D`, 'transparent']} style={styles.heroSection}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={handleChangeAvatar} disabled={isUploadingAvatar}>
                        <Avatar uri={profile.avatar_url} name={profile.nom_complet || ''} size={90} />
                        <View style={styles.editAvatarIcon}>
                            <MaterialIcons name="edit" size={14} color={COLORS.surface} />
                        </View>
                        {isUploadingAvatar && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="small" color={COLORS.surface} />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.nameRow}>
                        <Text style={styles.userName}>{profile.nom_complet}</Text>
                        <TouchableOpacity onPress={() => setIsEditVisible(true)} style={{ marginLeft: 8 }}>
                            <MaterialIcons name="edit" size={18} color={COLORS.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.roleBadge, { backgroundColor: `${roleColor}1A` }]}>
                        <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
                    </View>

                    <Text style={styles.userMeta}>📱 {profile.numero_telephone}</Text>
                    <Text style={styles.userMeta}>{t('profile.member_since', { date: format(new Date(profile.date_inscription), 'MMM yyyy', { locale: fr }) })}</Text>
                </LinearGradient>

                {/* Trust Badge */}
                <TrustBadge isVerified={Boolean((profile as any).statut_verification)} onPressVerify={() => router.push('/kyc')} />

                {/* Stats Grid */}
                {stats && <StatsGrid stats={stats} role={profile.role} />}

                {/* Sections Spécifiques */}
                {profile.role === 'proprietaire' && (
                    <MyPropertiesSection
                        properties={myProperties}
                        onUpdateStatus={updatePropertyStatus}
                        onDeleteProperty={deleteProperty}
                    />
                )}

                {profile.role === 'locataire' && (
                    <MyVisitsSection visits={myVisits} />
                )}

                {/* Menu Actions */}
                <View style={styles.menuContainer}>
                    <MenuActionItem icon="person-outline" color={COLORS.primary} label={t('profile.edit_profile')} onPress={() => setIsEditVisible(true)} />
                    <MenuActionItem icon="flag" color={COLORS.danger} label={t('profile.my_reports')} onPress={() => { }} />
                    <View style={styles.divider} />
                    <MenuActionItem icon="help-outline" color={COLORS.textSecondary} label={t('profile.help')} onPress={() => Linking.openURL('https://example.com/support')} />
                    <MenuActionItem icon="star-outline" color={COLORS.warning} label={t('profile.rate_app')} onPress={() => { }} />
                    <MenuActionItem icon="share" color={COLORS.secondary} label={t('profile.share_app')} onPress={handleShare} />
                </View>

                {/* Bouton Déconnexion */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <MaterialIcons name="logout" size={20} color={COLORS.danger} style={{ marginRight: 8 }} />
                    <Text style={styles.logoutText}>{t('auth.logout')}</Text>
                </TouchableOpacity>

                <Text style={styles.appVersion}>{t('profile.version')}</Text>
            </ScrollView>

            {/* Modals */}
            <ParametresModal visible={isParametresVisible} onClose={() => setIsParametresVisible(false)} />
            <EditProfileModal
                visible={isEditVisible}
                onClose={() => setIsEditVisible(false)}
                profile={profile}
                onSave={updateProfile}
                isSaving={isUpdatingProfile}
            />
        </View>
    );
}

const MenuActionItem = ({ icon, color, label, onPress }: { icon: string, color: string, label: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
        <View style={styles.actionLeft}>
            <View style={[styles.actionIconBg, { backgroundColor: `${color}1A` }]}>
                <MaterialIcons name={icon as any} size={20} color={color} />
            </View>
            <Text style={styles.actionLabel}>{label}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    settingsBtn: {
        position: 'absolute',
        right: SPACING.md,
        top: 50,
        padding: SPACING.xs,
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: SPACING.md,
    },
    editAvatarIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.surface,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    roleText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    },
    userMeta: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    menuContainer: {
        backgroundColor: COLORS.surface,
        marginHorizontal: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        marginVertical: SPACING.md,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    actionLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
        marginLeft: 68,
    },
    logoutBtn: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.danger,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.xl,
    },
    logoutText: {
        color: COLORS.danger,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    appVersion: {
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
    }
});
