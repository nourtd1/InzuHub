import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';

interface TrustBadgeProps {
    isVerified: boolean;
    onPressVerify: () => void;
}

export default function TrustBadge({ isVerified, onPressVerify }: TrustBadgeProps) {
    if (isVerified) {
        return (
            <View style={[styles.container, styles.containerVerified]}>
                <View style={styles.header}>
                    <MaterialIcons name="check-circle" size={24} color={COLORS.secondary} />
                    <Text style={[styles.title, { color: COLORS.secondary }]}>Identité Vérifiée</Text>
                </View>
                <Text style={styles.subtitle}>
                    Votre compte est certifié par InzuHub. Les autres utilisateurs vous font confiance.
                </Text>
                {renderProgressBar(true)}
            </View>
        );
    }

    return (
        <View style={[styles.container, styles.containerUnverified]}>
            <View style={styles.header}>
                <MaterialIcons name="warning" size={24} color={COLORS.warning} />
                <Text style={[styles.title, { color: COLORS.warning }]}>Identité Non Vérifiée</Text>
            </View>
            <Text style={styles.subtitle}>
                Vérifiez votre identité pour inspirer confiance et recevoir plus de réponses.
            </Text>

            <TouchableOpacity style={styles.verifyBtn} onPress={onPressVerify}>
                <Text style={styles.verifyBtnText}>→ Vérifier mon identité</Text>
            </TouchableOpacity>

            {renderProgressBar(false)}
        </View>
    );
}

const renderProgressBar = (isVerified: boolean) => {
    return (
        <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
                <MaterialIcons name="check-circle" size={16} color={COLORS.secondary} />
                <Text style={styles.progressLabel}>Inscrit</Text>
            </View>

            <View style={[styles.progressLine, isVerified ? { backgroundColor: COLORS.secondary } : {}]} />

            <View style={styles.progressStep}>
                <MaterialIcons name={isVerified ? "check-circle" : "help-outline"} size={16} color={isVerified ? COLORS.secondary : COLORS.textSecondary} />
                <Text style={styles.progressLabel}>Vérifié</Text>
            </View>

            <View style={[styles.progressLine, { backgroundColor: COLORS.border }]} />

            <View style={styles.progressStep}>
                <MaterialIcons name="star-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.progressLabel}>Membre de confiance</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.md,
        marginHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
    },
    containerVerified: {
        backgroundColor: `${COLORS.secondary}1A`, // 10% opacity
        borderColor: COLORS.secondary,
    },
    containerUnverified: {
        backgroundColor: `${COLORS.warning}1A`, // 10% opacity
        borderColor: COLORS.warning,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        lineHeight: 20,
        marginBottom: 12,
    },
    verifyBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
        marginBottom: 12,
    },
    verifyBtnText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.sm,
    },
    progressStep: {
        alignItems: 'center',
        width: 60,
    },
    progressLabel: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: 4,
        alignSelf: 'flex-start',
        marginTop: 8,
    }
});
