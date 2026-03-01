import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';
import { CreateAvisData } from '../../services/avisService';
import { VisiteComplete } from '../../types/database.types';
import StarRating from '../ui/StarRating';
import { Image } from 'expo-image';
import { Button } from '../ui/Button';
import { formatDateRelative } from '../../utils/formatters';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface AvisModalProps {
    isVisible: boolean;
    visite: VisiteComplete;
    onClose: () => void;
    onSubmit: (data: CreateAvisData) => Promise<void>;
    isSubmitting: boolean;
}

export default function AvisModal({ isVisible, visite, onClose, onSubmit, isSubmitting }: AvisModalProps) {
    const { t } = useTranslation();
    const [note, setNote] = useState<number>(0);
    const [commentaire, setCommentaire] = useState('');

    const getNoteLabel = (n: number) => {
        if (n === 1) return t('reviews.ratings.1');
        if (n === 2) return t('reviews.ratings.2');
        if (n === 3) return t('reviews.ratings.3');
        if (n === 4) return t('reviews.ratings.4');
        if (n === 5) return t('reviews.ratings.5');
        return '';
    };

    const handleSubmit = async () => {
        if (note < 1 || note > 5) return;

        await onSubmit({
            id_proprietaire: visite.conversation.proprietaire.id_utilisateur,
            id_visite: visite.id_visite,
            id_propriete: visite.conversation.propriete.id_propriete,
            note: note as 1 | 2 | 3 | 4 | 5,
            commentaire: commentaire.trim() || undefined
        });

        // Reset state for next time
        setNote(0);
        setCommentaire('');
    };

    const propr = visite.conversation.propriete;
    const proprOwner = visite.conversation.proprietaire;

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
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.handle} />
                            <Text style={styles.title}>{t('reviews.modal_title')}</Text>
                            <Text style={styles.subtitle}>{t('reviews.for_owner', { name: proprOwner.nom_complet || 'Propriétaire' })}</Text>
                        </View>

                        {/* Propriété */}
                        <View style={styles.propertySection}>
                            {propr.photos && propr.photos.length > 0 && (
                                <Image source={{ uri: propr.photos[0].url_photo }} style={styles.propertyImage} />
                            )}
                            <View style={styles.propertyInfo}>
                                <Text style={styles.propertyTitle} numberOfLines={1}>{propr.titre}</Text>
                                <Text style={styles.propertyLocation}>📍 {propr.quartier?.nom_quartier || 'Gisenyi'}</Text>
                                <Text style={styles.visitDate}>📆 Visite du {formatDateRelative(visite.date_visite)}</Text>
                            </View>
                        </View>

                        {/* Stars */}
                        <View style={styles.starsSection}>
                            <StarRating value={note} onChange={setNote} size={40} />
                            <Text style={styles.noteLabel}>{getNoteLabel(note)}</Text>
                        </View>

                        {/* Commentaire */}
                        <View style={styles.commentSection}>
                            <Text style={styles.commentLabel}>{t('reviews.comment_label')}</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    multiline
                                    maxLength={300}
                                    placeholder={t('reviews.comment_placeholder')}
                                    placeholderTextColor={COLORS.textSecondary}
                                    value={commentaire}
                                    onChangeText={setCommentaire}
                                />
                                <Text style={styles.charCount}>{commentaire.length}/300</Text>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                title={t('common.cancel')}
                                onPress={onClose}
                                variant="outline"
                                style={{ flex: 1, marginRight: SPACING.sm }}
                            />
                            <Button
                                title={t('reviews.submit')}
                                onPress={handleSubmit}
                                disabled={note === 0 || isSubmitting}
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
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        maxHeight: '90%',
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
    propertySection: {
        flexDirection: 'row',
        backgroundColor: COLORS.background,
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.xl,
    },
    propertyImage: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.sm,
        marginRight: SPACING.sm,
    },
    propertyInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    propertyTitle: {
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    propertyLocation: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    visitDate: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    starsSection: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    noteLabel: {
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textSecondary,
        fontWeight: '600',
        minHeight: 20,
    },
    commentSection: {
        marginBottom: SPACING.xl,
    },
    commentLabel: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '600',
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    inputContainer: {
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: SPACING.sm,
    },
    input: {
        minHeight: 100,
        textAlignVertical: 'top',
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    charCount: {
        textAlign: 'right',
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: SPACING.xs,
    },
    actions: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
    }
});
