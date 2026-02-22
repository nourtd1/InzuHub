
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { InputField } from '../../src/components/ui/InputField';
import { Button } from '../../src/components/ui/Button';
import { RoleSelector } from '../../src/components/ui/RoleSelector';
import { PasswordStrengthIndicator } from '../../src/components/ui/PasswordStrengthIndicator';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';

export default function RegisterScreen() {
    const router = useRouter();
    const { signUp } = useAuth();

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
            newErrors.nomComplet = 'Le nom complet doit contenir au moins 3 caractères';
        }

        const phoneRegex = /^\+2507[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            newErrors.phone = 'Format invalide. Ex: +250788123456';
        }

        if (password.length < 8) {
            newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
            Alert.alert('Erreur', error);
        } else {
            // Navigation is handled by RootLayout's auth listener, but we can also force it if needed
            // router.replace('/(app)/(tabs)'); 
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} scrollEnabled={true}>
            <View style={styles.header}>
                <Text style={styles.logo}>InzuHub</Text>
                <Text style={styles.tagline}>Trouvez votre maison à Gisenyi</Text>
            </View>

            <View style={styles.form}>
                <InputField
                    label="Nom complet"
                    placeholder="Ex: Jean-Paul Habimana"
                    value={nomComplet}
                    onChangeText={setNomComplet}
                    error={errors.nomComplet}
                />

                <InputField
                    label="Numéro de téléphone"
                    placeholder="+250 7XX XXX XXX"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    error={errors.phone}
                />

                <InputField
                    label="Mot de passe"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    error={errors.password}
                />
                <PasswordStrengthIndicator password={password} />

                <InputField
                    label="Confirmer le mot de passe"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    error={errors.confirmPassword}
                />

                <RoleSelector value={role} onChange={setRole} />

                <Button
                    title="Créer mon compte"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Déjà un compte ? </Text>
                    <TouchableOpacity onPress={() => router.navigate('/(auth)/login')}>
                        <Text style={styles.link}>Se connecter</Text>
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
        paddingTop: SPACING.xxl,
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
