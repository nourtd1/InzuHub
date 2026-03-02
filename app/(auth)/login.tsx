
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputField } from '../../src/components/ui/InputField';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n/useTranslation';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const { t } = useTranslation();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert(t('common.error'), t('auth.errors.invalid_credentials'));
            return;
        }

        // Basic validation for phone to ensure it matches format roughly before sending
        const phoneRegex = /^\+2507[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            Alert.alert(t('common.error'), t('auth.phone_error'));
            return;
        }

        setLoading(true);
        const { error } = await signIn({
            numero_telephone: phone,
            mot_de_passe: password,
        });

        setLoading(false);

        if (error) {
            Alert.alert(t('common.error'), error);
        }
    };

    const insets = useSafeAreaInsets();

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, SPACING.lg),
                    paddingTop: Math.max(insets.top, SPACING.xxl),
                },
            ]}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.logoCard}>
                <Feather name="home" size={28} color="#FFFFFF" />
            </View>

            <Text style={styles.appName}>{t('common.app_name')}</Text>
            <Text style={styles.tagline}>Trouvez votre prochain foyer à Gisenyi</Text>

            <View style={styles.welcomeBlock}>
                <Text style={styles.welcomeTitle}>Bon retour parmi nous</Text>
            </View>

            <View style={styles.form}>
                <InputField
                    label={t('auth.phone_label')}
                    placeholder={t('auth.phone_placeholder')}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    leftIcon={<Feather name="user" size={18} color={COLORS.textSecondary} />}
                />

                <InputField
                    label={t('auth.password_label')}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    leftIcon={<Feather name="lock" size={18} color={COLORS.textSecondary} />}
                />

                <TouchableOpacity
                    onPress={() => Alert.alert(t('common.error'), 'Fonctionnalité non disponible pour le moment')}
                    style={styles.forgotLinkContainer}
                    activeOpacity={0.7}
                >
                    <Text style={styles.forgotLink}>Mot de passe oublié ?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={styles.primaryButtonContainer}
                >
                    <LinearGradient
                        colors={[COLORS.secondary, '#2DE6B7']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.primaryButton, loading ? styles.primaryButtonDisabled : null]}
                    >
                        <Text style={styles.primaryButtonText}>{loading ? '...' : 'Se connecter'}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.separatorRow}>
                    <View style={styles.separatorLine} />
                    <Text style={styles.separatorText}>Ou continuer avec</Text>
                    <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity
                    onPress={() => Alert.alert(t('common.error'), 'Google non configuré')}
                    activeOpacity={0.85}
                    style={styles.googleButton}
                >
                    <View style={styles.googleIcon}>
                        <Text style={styles.googleIconText}>G</Text>
                    </View>
                    <Text style={styles.googleButtonText}>Google</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Vous n'avez pas de compte ? </Text>
                    <TouchableOpacity onPress={() => router.navigate('/(auth)/register')} activeOpacity={0.7}>
                        <Text style={styles.link}>Inscrivez-vous</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
        alignItems: 'center',
    },
    logoCard: {
        width: 64,
        height: 64,
        borderRadius: 18,
        backgroundColor: COLORS.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    appName: {
        fontSize: TYPOGRAPHY.fontSizeXXL,
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    tagline: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    welcomeBlock: {
        width: '100%',
        maxWidth: 420,
        marginBottom: SPACING.md,
    },
    welcomeTitle: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    form: {
        width: '100%',
        maxWidth: 420,
    },
    forgotLinkContainer: {
        alignSelf: 'flex-end',
        marginTop: -SPACING.xs,
        marginBottom: SPACING.lg,
    },
    forgotLink: {
        color: COLORS.secondary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
    },
    primaryButtonContainer: {
        width: '100%',
    },
    primaryButton: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButtonDisabled: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    separatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    separatorText: {
        marginHorizontal: SPACING.md,
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '500',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        width: '100%',
    },
    googleIcon: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
        backgroundColor: '#F2F2F2',
    },
    googleIconText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#4285F4',
    },
    googleButtonText: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.lg,
        flexWrap: 'wrap',
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    link: {
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
});
