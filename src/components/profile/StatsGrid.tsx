import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { ProfileStats } from '../../services/profileService';

interface StatsGridProps {
    stats: ProfileStats;
    role: 'locataire' | 'proprietaire' | 'administrateur';
}

export default function StatsGrid({ stats, role }: StatsGridProps) {
    const router = useRouter();

    if (role === 'proprietaire') {
        return (
            <View style={styles.gridContainer}>
                <View style={styles.row}>
                    <StatCard icon="🏠" finalValue={stats.totalAnnonces} label="Annonces" />
                    <StatCard icon="✅" finalValue={stats.annoncesLouees} label="Louées" />
                </View>
                <View style={styles.row}>
                    <StatCard icon="💬" finalValue={stats.totalConversations} label="Messages" />
                    <StatCard icon="👀" finalValue={0} label="Vues*" subLabel="Bientôt" />
                </View>
            </View>
        );
    }

    // Default to locataire stats
    return (
        <View style={styles.gridContainer}>
            <View style={styles.row}>
                <StatCard icon="💬" finalValue={stats.conversationsActives} label="Conversations" />
                <StatCard icon="📅" finalValue={stats.totalVisites} label="Visites" />
            </View>
            <View style={styles.row}>
                <StatCard icon="✅" finalValue={stats.visitesConfirmees} label="Confirmées" />
                <StatCard icon="❤️" finalValue={stats.favoris || 0} label="Favoris" onPress={() => router.push('/(app)/favorites')} />
            </View>
        </View>
    );
}

const StatCard = ({ icon, finalValue, label, subLabel, onPress }: { icon: string, finalValue: number, label: string, subLabel?: string, onPress?: () => void }) => {
    // Simple countUp effect simulation
    const countRender = finalValue; // Using native Animated on text values is complex without reanimated.
    // We will simulate it via standard local state if true countup is strictly needed, but let's keep it simple or use a basic interval
    const [displayVal, setDisplayVal] = React.useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const duration = 800; // ms

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = (time - startTime) / duration;

            if (progress < 1) {
                setDisplayVal(Math.floor(finalValue * progress));
                requestAnimationFrame(animate);
            } else {
                setDisplayVal(finalValue);
            }
        };

        requestAnimationFrame(animate);
    }, [finalValue]);

    const inner = (
        <>
            <View style={styles.cardHeader}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.value}>{displayVal}</Text>
            </View>
            <Text style={styles.label}>{label}</Text>
            {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity style={styles.card} onPress={onPress}>
                {inner}
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.card}>
            {inner}
        </View>
    );
};

const styles = StyleSheet.create({
    gridContainer: {
        paddingHorizontal: SPACING.md,
        marginVertical: SPACING.sm,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        flex: 1,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginHorizontal: 4,
        borderColor: COLORS.border,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 20,
        marginRight: 8,
    },
    value: {
        fontSize: TYPOGRAPHY.fontSizeXL,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
    },
    subLabel: {
        fontSize: 10,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 2,
    }
});
