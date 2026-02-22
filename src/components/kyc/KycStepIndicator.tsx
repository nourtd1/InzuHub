import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface KycStepIndicatorProps {
    currentStep: 1 | 2 | 3;
    completedSteps: number[];
}

export default function KycStepIndicator({ currentStep, completedSteps }: KycStepIndicatorProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const renderCircle = (stepNum: number, label: string) => {
        const isCompleted = completedSteps.includes(stepNum);
        const isCurrent = currentStep === stepNum;

        let content = <Text style={[styles.number, isCurrent && { color: COLORS.surface }]}>{stepNum}</Text>;
        if (isCompleted) {
            content = <MaterialIcons name="check" size={16} color={COLORS.surface} />;
        }

        return (
            <View style={styles.stepWrapper}>
                <View style={[
                    styles.circle,
                    isCompleted ? { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary } :
                        isCurrent ? { backgroundColor: COLORS.primary, borderColor: COLORS.primary } :
                            { backgroundColor: COLORS.surface, borderColor: COLORS.border }
                ]}>
                    {content}
                </View>
                {isCurrent && (
                    <Animated.View style={[
                        styles.pulseRing,
                        { transform: [{ scale: pulseAnim }], borderColor: COLORS.primary }
                    ]} />
                )}
                <Text style={styles.label}>{label}</Text>
            </View>
        );
    };

    const renderLine = (fromStep: number) => {
        const isCompleted = completedSteps.includes(fromStep);
        return <View style={[styles.line, isCompleted && { backgroundColor: COLORS.secondary }]} />;
    };

    return (
        <View style={styles.container}>
            {renderCircle(1, 'Recto')}
            {renderLine(1)}
            {renderCircle(2, 'Verso')}
            {renderLine(2)}
            {renderCircle(3, 'Selfie')}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 24,
    },
    stepWrapper: {
        alignItems: 'center',
        width: 60,
        position: 'relative',
    },
    circle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    pulseRing: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        opacity: 0.3,
        top: -4,
        zIndex: 1,
    },
    number: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textSecondary,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: 6,
        textAlign: 'center',
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: COLORS.border,
        marginHorizontal: -4,
        zIndex: 0,
        maxWidth: 60,
        alignSelf: 'center',
        marginBottom: 20,
    }
});
