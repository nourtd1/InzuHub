
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InputField } from '../../src/components/ui/InputField';
import { Button } from '../../src/components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '../../src/i18n/useTranslation';

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
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.lg), paddingTop: Math.max(insets.top, SPACING.lg) }]} scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.logo}>{t('common.app_name')}</Text>
                <Text style={styles.tagline}>{t('auth.login_subtitle')}</Text>
            </View>

            <View style={styles.illustration}>
                <Feather name="home" size={64} color={COLORS.primary} />
            </View>

            <View style={styles.form}>
                <InputField
                    label={t('auth.phone_label')}
                    placeholder={t('auth.phone_placeholder')}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <InputField
                    label={t('auth.password_label')}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button
                    title={t('auth.login_button')}
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>{t('auth.no_account').split('?')[0]}? </Text>
                    <TouchableOpacity onPress={() => router.navigate('/(auth)/register')}>
                        <Text style={styles.link}>{t('auth.no_account').split('?')[1]?.trim()}</Text>
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
        justifyContent: 'center',
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
    illustration: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    form: {
        width: '100%',
    },
    submitButton: {
        marginTop: SPACING.md,
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
