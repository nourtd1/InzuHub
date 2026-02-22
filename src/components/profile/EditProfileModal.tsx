import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { Utilisateur } from '../../types/database.types';

const { height } = Dimensions.get('window');

interface EditProfileModalProps {
    visible: boolean;
    onClose: () => void;
    profile: Utilisateur | null;
    onSave: (data: Partial<Utilisateur>) => Promise<void>;
    isSaving: boolean;
}

export default function EditProfileModal({ visible, onClose, profile, onSave, isSaving }: EditProfileModalProps) {
    const [nomComplet, setNomComplet] = useState('');
    const [telephone, setTelephone] = useState('');

    useEffect(() => {
        if (visible && profile) {
            setNomComplet(profile.nom_complet || '');
            setTelephone(profile.numero_telephone || '');
        }
    }, [visible, profile]);

    const handleSave = async () => {
        if (nomComplet.length < 3) return;
        await onSave({ nom_complet: nomComplet, numero_telephone: telephone });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                            <Text style={styles.headerBtnTextCancel}>Annuler</Text>
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Modifier Profil</Text>
                        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={isSaving || nomComplet.length < 3}>
                            {isSaving ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={[styles.headerBtnTextSave, nomComplet.length < 3 && styles.disabledText]}>Enregistrer</Text>}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Nom complet</Text>
                            <TextInput
                                style={styles.input}
                                value={nomComplet}
                                onChangeText={setNomComplet}
                                placeholder="Votre nom"
                                placeholderTextColor={COLORS.textSecondary}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Numéro de téléphone</Text>
                            <TextInput
                                style={styles.input}
                                value={telephone}
                                onChangeText={setTelephone}
                                placeholder="+250 788 123 456"
                                placeholderTextColor={COLORS.textSecondary}
                                keyboardType="phone-pad"
                            />
                            <Text style={styles.note}>
                                Le numéro est aussi votre identifiant de connexion. Le modifier peut affecter votre accès.
                            </Text>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        height: height * 0.5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    headerBtn: {
        padding: SPACING.xs,
    },
    headerBtnTextCancel: {
        color: COLORS.textSecondary,
        fontSize: TYPOGRAPHY.fontSizeMD,
    },
    headerBtnTextSave: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
    },
    disabledText: {
        opacity: 0.5,
    },
    content: {
        padding: SPACING.md,
    },
    inputContainer: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
    },
    note: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
        marginTop: 6,
        lineHeight: 16,
    }
});
