
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputField } from '../../src/components/ui/InputField';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { useTranslation } from '../../src/i18n/useTranslation';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { t } = useTranslation();

    const [nomComplet, setNomComplet] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'locataire' | 'proprietaire'>('locataire');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (nomComplet.length < 3) {
            newErrors.nomComplet = t('common.error');
        }

        const phoneRegex = /^\+2507[0-9]{8}$/;
        if (!phoneRegex.test(identifier)) {
            newErrors.identifier = t('auth.phone_error');
        }

        if (password.length < 8) {
            newErrors.password = t('auth.password_placeholder');
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = t('auth.confirm_password_error');
        }

        if (!acceptedTerms) {
            newErrors.terms = 'Veuillez accepter les conditions.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        const { error } = await signUp({
            nom_complet: nomComplet,
            numero_telephone: identifier,
            mot_de_passe: password,
            role,
        });

        setLoading(false);

        if (error) {
            Alert.alert(t('common.error'), error);
        } else {
            // Navigation is handled by RootLayout's auth listener, but we can also force it if needed
            // router.replace('/(app)/(tabs)'); 
        }
    };

    const insets = useSafeAreaInsets();

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                {
                    paddingBottom: Math.max(insets.bottom, SPACING.lg),
                    paddingTop: Math.max(insets.top, SPACING.lg),
                },
            ]}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={22} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.topBarTitle}>Inscription</Text>
                <View style={styles.topBarSpacer} />
            </View>

            <View style={styles.header}>
                <Text style={styles.headline}>Créer votre compte{`\n`}{t('common.app_name')}</Text>
                <Text style={styles.subheadline}>
                    Rejoignez la première plateforme immobilière à Gisenyi pour trouver votre prochain chez-vous.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionLabel}>JE SUIS :</Text>

                <View style={styles.roleRow}>
                    <TouchableOpacity
                        onPress={() => setRole('locataire')}
                        activeOpacity={0.9}
                        style={[styles.roleCard, role === 'locataire' ? styles.roleCardActive : null]}
                    >
                        <View style={styles.roleIconWrap}>
                            <Feather name="home" size={18} color={role === 'locataire' ? COLORS.secondary : COLORS.textSecondary} />
                        </View>
                        <Text style={[styles.roleText, role === 'locataire' ? styles.roleTextActive : null]}>Locataire</Text>
                        {role === 'locataire' ? (
                            <Feather name="check-circle" size={18} color={COLORS.secondary} />
                        ) : (
                            <View style={styles.roleCheckPlaceholder} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setRole('proprietaire')}
                        activeOpacity={0.9}
                        style={[styles.roleCard, role === 'proprietaire' ? styles.roleCardActive : null]}
                    >
                        <View style={styles.roleIconWrap}>
                            <Feather name="key" size={18} color={role === 'proprietaire' ? COLORS.secondary : COLORS.textSecondary} />
                        </View>
                        <Text style={[styles.roleText, role === 'proprietaire' ? styles.roleTextActive : null]}>Propriétaire</Text>
                        {role === 'proprietaire' ? (
                            <Feather name="check-circle" size={18} color={COLORS.secondary} />
                        ) : (
                            <View style={styles.roleCheckPlaceholder} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.form}>
                <InputField
                    label="Nom complet"
                    placeholder="Ex: Jean-Paul Ndayisaba"
                    value={nomComplet}
                    onChangeText={setNomComplet}
                    error={errors.nomComplet}
                    leftIcon={<Feather name="user" size={18} color={COLORS.textSecondary} />}
                />

                <InputField
                    label={t('auth.phone_label')}
                    placeholder={t('auth.phone_placeholder')}
                    value={identifier}
                    onChangeText={setIdentifier}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    error={errors.identifier}
                    leftIcon={<Feather name="at-sign" size={18} color={COLORS.textSecondary} />}
                />

                <InputField
                    label={t('auth.password_label')}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                    leftIcon={<Feather name="lock" size={18} color={COLORS.textSecondary} />}
                />

                <InputField
                    label={t('auth.confirm_password_label')}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                    leftIcon={<Feather name="lock" size={18} color={COLORS.textSecondary} />}
                />

                <View style={styles.termsRow}>
                    <TouchableOpacity
                        onPress={() => setAcceptedTerms(v => !v)}
                        style={[styles.checkbox, acceptedTerms ? styles.checkboxChecked : null]}
                        activeOpacity={0.8}
                    >
                        {acceptedTerms ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
                    </TouchableOpacity>

                    <Text style={styles.termsText}>
                        J'accepte les{' '}
                        <Text
                            style={styles.termsLink}
                            onPress={() => Linking.openURL('https://www.privacypolicies.com/live/7ffeaaff-93c3-49e8-95b3-c0ad146864a4')}
                        >
                            Conditions d'utilisation
                        </Text>
                        {' '}et la{' '}
                        <Text
                            style={styles.termsLink}
                            onPress={() => Linking.openURL('https://www.privacypolicies.com/live/7ffeaaff-93c3-49e8-95b3-c0ad146864a4')}
                        >
                            Politique de confidentialité
                        </Text>
                        {' '}d'InzuHub.
                    </Text>
                </View>

                {errors.terms ? <Text style={styles.termsError}>{errors.terms}</Text> : null}

                <TouchableOpacity
                    onPress={handleRegister}
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
                        <Text style={styles.primaryButtonText}>{loading ? '...' : 'Créer mon compte'}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('auth.has_account').split('?')[0]}? </Text>
                    <TouchableOpacity onPress={() => router.navigate('/(auth)/login')} activeOpacity={0.7}>
                        <Text style={styles.footerLink}>{t('auth.has_account').split('?')[1]?.trim()}</Text>
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
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    topBarTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    topBarSpacer: {
        width: 40,
    },
    header: {
        marginBottom: SPACING.xl,
    },
    headline: {
        fontSize: 30,
        fontWeight: '900',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
        lineHeight: 36,
    },
    subheadline: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        lineHeight: 22,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '800',
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    roleRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    roleCard: {
        flex: 1,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roleCardActive: {
        borderColor: COLORS.secondary,
        backgroundColor: 'rgba(0, 200, 150, 0.08)',
    },
    roleIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor: '#F2F4FA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    roleText: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '700',
        color: COLORS.textSecondary,
    },
    roleTextActive: {
        color: COLORS.textPrimary,
    },
    roleCheckPlaceholder: {
        width: 18,
        height: 18,
    },
    form: {
        width: '100%',
    },
    termsRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: SPACING.sm,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.sm,
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    termsText: {
        flex: 1,
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    termsLink: {
        color: COLORS.secondary,
        fontWeight: '700',
    },
    termsError: {
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.danger,
    },
    primaryButtonContainer: {
        width: '100%',
        marginTop: SPACING.lg,
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.xl,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    footerLink: {
        color: COLORS.secondary,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
});
