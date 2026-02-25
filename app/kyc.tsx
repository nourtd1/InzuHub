import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Theme from '../src/constants/theme';
import { Button } from '../src/components/ui/Button';

export default function KYC() {
    const router = useRouter();

    const handleVerify = () => {
        // Logic to upload ID document
        console.log('Upload ID');
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Vérification d'Identité</Text>
            <Text style={styles.description}>
                Pour garantir la sécurité de la communauté InzuHub, nous devons vérifier votre identité.
            </Text>

            <View style={styles.content}>
                <View style={styles.step}>
                    <Text style={styles.stepTitle}>1. Photo de votre ID</Text>
                    <Text style={styles.stepDesc}>Carte d'identité ou Passeport</Text>
                </View>
                <View style={styles.step}>
                    <Text style={styles.stepTitle}>2. Selfie</Text>
                    <Text style={styles.stepDesc}>Pour vérifier que c'est bien vous</Text>
                </View>
            </View>

            <Button title="Commencer la vérification" onPress={handleVerify} />
            <Button title="Plus tard" variant="ghost" onPress={() => router.back()} style={{ marginTop: 10 }} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Theme.spacing.lg,
        backgroundColor: Theme.colors.surface,
    },
    title: {
        fontSize: Theme.typography.fontSizeXL,
        fontWeight: 'bold',
        color: Theme.colors.textPrimary,
        marginBottom: Theme.spacing.md,
    },
    description: {
        fontSize: Theme.typography.fontSizeMD,
        color: Theme.colors.textSecondary,
        marginBottom: Theme.spacing.xl,
    },
    content: {
        marginBottom: Theme.spacing.xl,
    },
    step: {
        marginBottom: Theme.spacing.md,
        padding: Theme.spacing.md,
        backgroundColor: Theme.colors.background,
        borderRadius: Theme.borderRadius.md,
    },
    stepTitle: {
        fontSize: Theme.typography.fontSizeMD,
        fontWeight: '600',
        color: Theme.colors.textPrimary,
    },
    stepDesc: {
        fontSize: Theme.typography.fontSizeSM,
        color: Theme.colors.textSecondary,
    },
});
