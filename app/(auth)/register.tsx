
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputField } from '../../src/components/ui/InputField';
import { Button } from '../../src/components/ui/Button';
import { RoleSelector } from '../../src/components/ui/RoleSelector';
import { PasswordStrengthIndicator } from '../../src/components/ui/PasswordStrengthIndicator';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { useTranslation } from '../../src/i18n/useTranslation';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { t } = useTranslation();

    const [nomComplet, setNomComplet] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<'locataire' | 'proprietaire'>('locataire');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (nomComplet.length < 3) {
            newErrors.nomComplet = t('common.error');
        }

        const phoneRegex = /^\+2507[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            newErrors.phone = t('auth.phone_error');
        }

        if (password.length < 8) {
            newErrors.password = t('auth.password_placeholder');
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = t('auth.confirm_password_error');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        const { error } = await signUp({
            nom_complet: nomComplet,
            numero_telephone: phone,
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
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.lg), paddingTop: Math.max(insets.top, SPACING.xxl) }]} scrollEnabled={true}>
            <View style={styles.header}>
                <Text style={styles.logo}>{t('common.app_name')}</Text>
                <Text style={styles.tagline}>{t('auth.login_subtitle')}</Text>
            </View>

            <View style={styles.form}>
                <InputField
                    label={t('auth.name_label')}
                    placeholder={t('auth.name_placeholder')}
                    value={nomComplet}
                    onChangeText={setNomComplet}
                    error={errors.nomComplet}
                />

                <InputField
                    label={t('auth.phone_label')}
                    placeholder={t('auth.phone_placeholder')}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    error={errors.phone}
                />

                <InputField
                    label={t('auth.password_label')}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                />
                <PasswordStrengthIndicator password={password} />

                <InputField
                    label={t('auth.confirm_password_label')}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                />

                <RoleSelector value={role} onChange={setRole} />

                <Text style={styles.termsText}>
                    En créant un compte, vous acceptez notre{' '}
                    <Text style={styles.termsLink} onPress={() => Linking.openURL('https://www.privacypolicies.com/live/7ffeaaff-93c3-49e8-95b3-c0ad146864a4')}>
                        Politique de confidentialité
                    </Text>.
                </Text>

                <Button
                    title={t('auth.register_button')}
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('auth.has_account').split('?')[0]}? </Text>
                    <TouchableOpacity onPress={() => router.navigate('/(auth)/login')}>
                        <Text style={styles.link}>{t('auth.has_account').split('?')[1]?.trim()}</Text>
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
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logo: {
        fontSize: TYPOGRAPHY.fontSizeXXL,
        fontWeight: '700',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    tagline: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
    },
    form: {
        width: '100%',
    },
    submitButton: {
        marginTop: SPACING.md,
    },
    termsText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    termsLink: {
        color: COLORS.primary,
        textDecorationLine: 'underline',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: SPACING.lg,
    },
    footerText: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    link: {
        color: COLORS.primary,
        fontWeight: '600',
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
});
