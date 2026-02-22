import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3;
    labels: string[];
}

export default function StepIndicator({ currentStep, labels }: StepIndicatorProps) {
    return (
        <View style={styles.container}>
            {labels.map((label, index) => {
                const stepNum = index + 1;
                const isPassed = stepNum <= currentStep;
                const isLast = index === labels.length - 1;

                return (
                    <View key={label} style={styles.stepWrapper}>
                        <View style={styles.circleContainer}>
                            <View style={[
                                styles.circle,
                                isPassed ? styles.circleActive : styles.circleInactive
                            ]} />
                            {!isLast && (
                                <View style={[
                                    styles.line,
                                    currentStep > stepNum ? styles.lineActive : styles.lineInactive
                                ]} />
                            )}
                        </View>
                        <Text style={[
                            styles.label,
                            isPassed ? styles.labelActive : styles.labelInactive
                        ]}>{label}</Text>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
        marginTop: 10,
    },
    stepWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    circleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center'
    },
    circle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        zIndex: 2,
    },
    circleActive: {
        backgroundColor: COLORS.primary,
    },
    circleInactive: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    line: {
        position: 'absolute',
        top: 4,
        left: '50%',
        width: '100%',
        height: 2,
        zIndex: 1,
    },
    lineActive: {
        backgroundColor: COLORS.primary,
    },
    lineInactive: {
        backgroundColor: COLORS.border,
    },
    label: {
        marginTop: 8,
        fontSize: TYPOGRAPHY.fontSizeXS,
        textAlign: 'center',
    },
    labelActive: {
        color: COLORS.textPrimary,
        fontWeight: '600',
    },
    labelInactive: {
        color: COLORS.textSecondary,
    }
});
