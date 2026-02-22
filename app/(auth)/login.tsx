
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { InputField } from '../../src/components/ui/InputField';
import { Button } from '../../src/components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        // Basic validation for phone to ensure it matches format roughly before sending
        const phoneRegex = /^\+2507[0-9]{8}$/;
        if (!phoneRegex.test(phone)) {
            Alert.alert('Erreur', 'Numéro de téléphone invalide. Format: +250788123456');
            return;
        }

        setLoading(true);
        const { error } = await signIn({
            numero_telephone: phone,
            mot_de_passe: password,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Erreur', error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} scrollEnabled={false} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <Text style={styles.logo}>InzuHub</Text>
                <Text style={styles.tagline}>Trouvez votre maison à Gisenyi</Text>
            </View>

            <View style={styles.illustration}>
                <Feather name="home" size={64} color={COLORS.primary} />
            </View>

            <View style={styles.form}>
                <InputField
                    label="Numéro de téléphone"
                    placeholder="+250 7XX XXX XXX"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />

                <InputField
                    label="Mot de passe"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Pas encore de compte ? </Text>
                    <TouchableOpacity onPress={() => router.navigate('/(auth)/register')}>
                        <Text style={styles.link}>S'inscrire</Text>
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
