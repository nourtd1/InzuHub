import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { router } from 'expo-router';

interface ChatHeaderMenuProps {
    propertyId: string;
    onReport: () => void;
    onDelete: () => void;
}

export default function ChatHeaderMenu({ propertyId, onReport, onDelete }: ChatHeaderMenuProps) {
    const [visible, setVisible] = useState(false);

    const closeMenu = () => setVisible(false);

    const handleViewProperty = () => {
        closeMenu();
        router.push(`/property/${propertyId}`);
    };

    const handleReport = () => {
        closeMenu();
        onReport();
    };

    const handleDelete = () => {
        closeMenu();
        onDelete();
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.iconButton}>
                <MaterialIcons name="more-vert" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={closeMenu}
            >
                <TouchableWithoutFeedback onPress={closeMenu}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menuContainer}>
                                <TouchableOpacity style={styles.menuItem} onPress={handleViewProperty}>
                                    <MaterialIcons name="home" size={20} color={COLORS.textPrimary} />
                                    <Text style={styles.menuText}>Voir l'annonce</Text>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
                                    <MaterialIcons name="flag" size={20} color={COLORS.textPrimary} />
                                    <Text style={styles.menuText}>Signaler l'annonce</Text>
                                </TouchableOpacity>

                                <View style={styles.divider} />

                                <TouchableOpacity style={[styles.menuItem, styles.deleteItem]} onPress={handleDelete}>
                                    <MaterialIcons name="delete" size={20} color={COLORS.danger} />
                                    <Text style={[styles.menuText, { color: COLORS.danger }]}>Supprimer la conversation</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    iconButton: {
        padding: SPACING.sm,
        marginRight: -SPACING.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 80, // rough estimate based on header
        paddingRight: SPACING.md,
    },
    menuContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
        width: 220,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: SPACING.md,
    },
    menuText: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
        marginHorizontal: SPACING.md,
    },
    deleteItem: {
        borderBottomLeftRadius: BORDER_RADIUS.lg,
        borderBottomRightRadius: BORDER_RADIUS.lg,
    }
});
