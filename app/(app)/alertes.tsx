import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../src/constants/theme';
import { useTranslation } from '../../src/i18n/useTranslation';
import { useAuth } from '../../src/hooks/useAuth';
import { useAlertes } from '../../src/hooks/useAlertes';
import AlerteCard from '../../src/components/alertes/AlerteCard';
import AlerteFormModal from '../../src/components/alertes/AlerteFormModal';
import { CreateAlerteData } from '../../src/services/alerteService';
import { AlerteAvecQuartier } from '../../src/types/database.types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';

export default function AlertesScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const { alertes, isLoading, createAlerte, updateAlerte, toggleAlerte, deleteAlerte, refresh } = useAlertes();

    const [modalVisible, setModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedAlerte, setSelectedAlerte] = useState<AlerteAvecQuartier | undefined>(undefined);

    useEffect(() => {
        refresh();
    }, []);

    const handleCreate = () => {
        setModalMode('create');
        setSelectedAlerte(undefined);
        setModalVisible(true);
    };

    const handleEdit = (alerte: AlerteAvecQuartier) => {
        setModalMode('edit');
        setSelectedAlerte(alerte);
        setModalVisible(true);
    };

    const handleDelete = (alerte: AlerteAvecQuartier) => {
        Alert.alert(
            t('common.delete'),
            t('alerts.delete_confirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.yes'), style: 'destructive', onPress: async () => {
                        await deleteAlerte(alerte.id_alerte);
                    }
                }
            ]
        );
    };

    const handleSave = async (data: CreateAlerteData) => {
        if (modalMode === 'create') {
            await createAlerte(data);
        } else if (modalMode === 'edit' && selectedAlerte) {
            await updateAlerte(selectedAlerte.id_alerte, data);
        }
    };

    const renderRightActions = (alerte: AlerteAvecQuartier) => {
        return (
            <TouchableOpacity style={styles.deleteAction} onPress={() => handleDelete(alerte)}>
                <MaterialIcons name="delete" size={24} color={COLORS.surface} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('alerts.title')}</Text>
                <TouchableOpacity
                    style={[styles.createBtn, alertes.length >= 5 && styles.createBtnDisabled]}
                    onPress={handleCreate}
                    disabled={alertes.length >= 5}
                >
                    <MaterialIcons name="add" size={20} color={COLORS.surface} />
                    <Text style={styles.createBtnText}>Créer</Text>
                </TouchableOpacity>
            </View>

            {/* Warning limite */}
            {alertes.length >= 5 && (
                <View style={styles.limitWarning}>
                    <MaterialIcons name="info-outline" size={16} color={COLORS.warning} />
                    <Text style={styles.limitText}>{t('alerts.limit_reached')}</Text>
                </View>
            )}

            {/* List */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : alertes.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyBanner}>
                        <Text style={styles.emptyBannerTitle}>🔔 {t('alerts.empty_title')}</Text>
                        <Text style={styles.emptyBannerSub}>{t('alerts.empty_subtitle')}</Text>
                        <TouchableOpacity style={styles.emptyBannerCta} onPress={handleCreate}>
                            <Text style={styles.emptyBannerCtaText}>{t('alerts.create_first')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <FlatList
                    data={alertes}
                    keyExtractor={(item) => item.id_alerte}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <Swipeable renderRightActions={() => renderRightActions(item)}>
                            <AlerteCard
                                alerte={item}
                                onToggle={(active) => toggleAlerte(item.id_alerte, active)}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => handleDelete(item)}
                            />
                        </Swipeable>
                    )}
                />
            )}

            <AlerteFormModal
                isVisible={modalVisible}
                mode={modalMode}
                alerte={selectedAlerte}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backBtn: {
        padding: SPACING.xs,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    createBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
    },
    createBtnDisabled: {
        backgroundColor: COLORS.border,
    },
    createBtnText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    limitWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${COLORS.warning}10`,
        padding: SPACING.sm,
    },
    limitText: {
        color: COLORS.warning,
        marginLeft: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: SPACING.md,
        paddingBottom: 100,
    },
    deleteAction: {
        backgroundColor: COLORS.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md, // Align with card margin
    },
    emptyContainer: {
        flex: 1,
        padding: SPACING.lg,
        justifyContent: 'center',
    },
    emptyBanner: {
        backgroundColor: `${COLORS.primary}0D`, // 5% opacity
        borderColor: `${COLORS.primary}33`,     // 20% opacity
        borderWidth: 1,
        borderRadius: BORDER_RADIUS.lg,
        padding: SPACING.xl,
        alignItems: 'center',
        textAlign: 'center',
    },
    emptyBannerTitle: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    emptyBannerSub: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
        lineHeight: 24,
    },
    emptyBannerCta: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        width: '100%',
        alignItems: 'center',
    },
    emptyBannerCtaText: {
        color: COLORS.surface,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeMD,
    }
});
