import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Animated } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import { CreateAlerteData } from '../../services/alerteService';
import { AlerteAvecQuartier, Quartier } from '../../types/database.types';
import { Button } from '../ui/Button';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { propertyService } from '../../services/propertyService';
import QuartierCard from '../post/QuartierCard';
import { Switch } from 'react-native-gesture-handler';

interface AlerteFormModalProps {
    isVisible: boolean;
    mode: 'create' | 'edit';
    alerte?: AlerteAvecQuartier;
    onClose: () => void;
    onSave: (data: CreateAlerteData) => Promise<void>;
}

export default function AlerteFormModal({ isVisible, mode, alerte, onClose, onSave }: AlerteFormModalProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quartiers, setQuartiers] = useState<Quartier[]>([]);

    const [nomAlerte, setNomAlerte] = useState('');
    const [idQuartier, setIdQuartier] = useState<string | undefined>(undefined);
    const [prixMin, setPrixMin] = useState<string>('');
    const [prixMax, setPrixMax] = useState<string>('');
    const [chambres, setChambres] = useState<number | undefined>(undefined);
    const [hasEau, setHasEau] = useState(false);
    const [hasElectricite, setHasElectricite] = useState(false);

    useEffect(() => {
        const fetchQuartiers = async () => {
            const data = await propertyService.fetchQuartiers();
            setQuartiers(data);
        };
        fetchQuartiers();
    }, []);

    useEffect(() => {
        if (isVisible) {
            if (mode === 'edit' && alerte) {
                setNomAlerte(alerte.nom_alerte);
                setIdQuartier(alerte.id_quartier || undefined);
                setPrixMin(alerte.prix_min ? alerte.prix_min.toString() : '');
                setPrixMax(alerte.prix_max ? alerte.prix_max.toString() : '');
                setChambres(alerte.nombre_chambres || undefined);
                setHasEau(alerte.has_eau || false);
                setHasElectricite(alerte.has_electricite || false);
            } else {
                setNomAlerte('');
                setIdQuartier(undefined);
                setPrixMin('');
                setPrixMax('');
                setChambres(undefined);
                setHasEau(false);
                setHasElectricite(false);
            }
            setIsSubmitting(false);
        }
    }, [isVisible, mode, alerte]);

    const handleSave = async () => {
        if (!nomAlerte.trim()) return;
        setIsSubmitting(true);
        try {
            await onSave({
                nom_alerte: nomAlerte.trim(),
                id_quartier: idQuartier,
                prix_min: prixMin ? parseInt(prixMin, 10) : undefined,
                prix_max: prixMax ? parseInt(prixMax, 10) : undefined,
                nombre_chambres: chambres,
                has_eau: hasEau || undefined,
                has_electricite: hasElectricite || undefined
            });
            onClose();
        } catch (error) {
            // Error managed by hook mostly, but reset submitting safely
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPreview = () => {
        const qName = idQuartier ? quartiers.find(q => q.id_quartier === idQuartier)?.nom_quartier : t('alerts.all_quartiers_label');
        let prixLabel = '';
        if (prixMin && prixMax) prixLabel = t('alerts.price_range', { min: prixMin, max: prixMax });
        else if (prixMax) prixLabel = t('alerts.max_price', { price: prixMax });
        else prixLabel = t('alerts.budget_label') + ' -';

        let chamLabel = '';
        if (chambres) {
            chamLabel = `🛏 Minimum ${chambres} chambres`;
        }

        let eqLabel = [];
        if (hasEau) eqLabel.push('💧 Eau');
        if (hasElectricite) eqLabel.push('⚡ Électricité');

        return (
            <View style={styles.previewContainer}>
                <Text style={styles.previewTitle}>{t('alerts.preview_title')}</Text>
                <Text style={styles.previewText}>📍 {qName}</Text>
                {prixLabel !== (t('alerts.budget_label') + ' -') && <Text style={styles.previewText}>💰 {prixLabel}</Text>}
                {chamLabel ? <Text style={styles.previewText}>{chamLabel}</Text> : null}
                {eqLabel.length > 0 && <Text style={styles.previewText}>{eqLabel.join('  ')}</Text>}
            </View>
        );
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <View style={styles.handle} />
                            <Text style={styles.title}>{mode === 'create' ? t('alerts.create') : t('alerts.edit')}</Text>
                            <Text style={styles.subtitle}>{t('alerts.form_subtitle')}</Text>
                        </View>

                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            {/* Nom de l'alerte */}
                            <View style={styles.fieldSection}>
                                <Text style={styles.label}>{t('alerts.name_label')}</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={t('alerts.name_placeholder')}
                                    placeholderTextColor={COLORS.textTertiary}
                                    value={nomAlerte}
                                    onChangeText={setNomAlerte}
                                    maxLength={50}
                                />
                            </View>

                            {/* Quartier */}
                            <View style={styles.fieldSection}>
                                <Text style={styles.label}>{t('alerts.quartier_label')}</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                    <View style={{ width: '48%' }}>
                                        <QuartierCard
                                            quartier={{ id_quartier: '', nom_quartier: t('alerts.all_quartiers') } as any}
                                            isSelected={idQuartier === undefined}
                                            onPress={() => setIdQuartier(undefined)}
                                        />
                                    </View>
                                    {quartiers.map(q => (
                                        <View key={q.id_quartier} style={{ width: '48%' }}>
                                            <QuartierCard
                                                quartier={q}
                                                isSelected={idQuartier === q.id_quartier}
                                                onPress={() => setIdQuartier(q.id_quartier)}
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Budget */}
                            <View style={styles.fieldSection}>
                                <Text style={styles.label}>{t('alerts.budget_label')}</Text>
                                <View style={styles.row}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginRight: SPACING.sm }]}
                                        placeholder="Min"
                                        placeholderTextColor={COLORS.textTertiary}
                                        value={prixMin}
                                        onChangeText={setPrixMin}
                                        keyboardType="numeric"
                                    />
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginLeft: SPACING.sm }]}
                                        placeholder="Max"
                                        placeholderTextColor={COLORS.textTertiary}
                                        value={prixMax}
                                        onChangeText={setPrixMax}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {/* Chambres */}
                            <View style={styles.fieldSection}>
                                <Text style={styles.label}>{t('alerts.bedrooms_label')}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
                                    {[undefined, 1, 2, 3, 4].map((c) => (
                                        <TouchableOpacity
                                            key={`cham-${c}`}
                                            style={[styles.pill, chambres === c ? styles.pillActive : styles.pillInactive]}
                                            onPress={() => setChambres(c)}
                                        >
                                            <Text style={chambres === c ? styles.pillTextActive : styles.pillTextInactive}>
                                                {c === undefined ? t('alerts.any_bedrooms') : `${c}+`}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Equipements */}
                            <View style={styles.fieldSection}>
                                <Text style={styles.label}>{t('alerts.equipment_label')}</Text>
                                <View style={styles.switchRow}>
                                    <Text style={styles.switchLabel}>💧 Eau courante obligatoire</Text>
                                    <Switch
                                        value={hasEau}
                                        onValueChange={setHasEau}
                                        trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
                                        thumbColor={hasEau ? COLORS.primary : COLORS.border}
                                    />
                                </View>
                                <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.switchLabel}>⚡ Électricité obligatoire</Text>
                                    <Switch
                                        value={hasElectricite}
                                        onValueChange={setHasElectricite}
                                        trackColor={{ false: COLORS.border, true: `${COLORS.primary}80` }}
                                        thumbColor={hasElectricite ? COLORS.primary : COLORS.border}
                                    />
                                </View>
                            </View>

                            {renderPreview()}

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                title={t('common.cancel')}
                                onPress={onClose}
                                variant="outline"
                                style={{ flex: 1, marginRight: SPACING.sm }}
                            />
                            <Button
                                title={isSubmitting ? t('alerts.saving') : t('alerts.save')}
                                onPress={handleSave}
                                disabled={!nomAlerte.trim() || isSubmitting}
                                loading={isSubmitting}
                                style={{ flex: 1, marginLeft: SPACING.sm }}
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '90%',
        minHeight: '70%',
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.fontSizeLG,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    fieldSection: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.md,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pill: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: SPACING.sm,
        borderWidth: 1,
    },
    pillActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    pillInactive: {
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
    },
    pillTextActive: {
        color: COLORS.surface,
        fontWeight: 'bold',
    },
    pillTextInactive: {
        color: COLORS.textPrimary,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    switchLabel: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    previewContainer: {
        backgroundColor: `${COLORS.primary}0D`, // 5% opacity
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.md,
        marginTop: SPACING.md,
    },
    previewTitle: {
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: SPACING.sm,
    },
    previewText: {
        color: COLORS.textPrimary,
        marginBottom: 4,
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
    actions: {
        flexDirection: 'row',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    }
});
