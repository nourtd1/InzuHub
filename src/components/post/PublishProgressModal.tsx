import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface PublishProgressModalProps {
    visible: boolean;
    step: number; // 1: Info, 2: Photos, 3: Success
}

export default function PublishProgressModal({ visible, step }: PublishProgressModalProps) {

    const spinAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.timing(spinAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const getIcon = (itemStep: number) => {
        if (step > itemStep) {
            return <MaterialIcons name="check-circle" size={24} color={COLORS.secondary} />;
        }
        if (step === itemStep) {
            return (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <MaterialIcons name="autorenew" size={24} color={COLORS.primary} />
                </Animated.View>
            );
        }
        return <MaterialIcons name="radio-button-unchecked" size={24} color={COLORS.border} />;
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Publication en cours...</Text>

                    <View style={styles.list}>
                        <View style={styles.listItem}>
                            {getIcon(1)}
                            <Text style={styles.listText}>Informations enregistrées</Text>
                        </View>
                        <View style={styles.listItem}>
                            {getIcon(2)}
                            <Text style={styles.listText}>Finalisation des photos...</Text>
                        </View>
                        <View style={styles.listItem}>
                            {getIcon(3)}
                            <Text style={styles.listText}>Mise en ligne de l'annonce</Text>
                        </View>
                    </View>

                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, { width: step === 1 ? '33%' : step === 2 ? '66%' : step === 3 ? '100%' : '0%' }]} />
                    </View>

                    <Text style={styles.footerText}>Merci de patienter quelques secondes...</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xl,
    },
    list: {
        width: '100%',
        gap: SPACING.md,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    progressBarBg: {
        width: '100%',
        height: 6,
        backgroundColor: COLORS.border,
        borderRadius: 3,
        marginTop: SPACING.xl,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    footerText: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontStyle: 'italic',
    }
});
