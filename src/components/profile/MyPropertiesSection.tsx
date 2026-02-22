import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { ProprieteAvecPhotos } from '../../types/database.types';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../../constants/theme';
import { formatPrix } from '../../utils/formatters';
import { router } from 'expo-router';

interface MyPropertiesSectionProps {
    properties: ProprieteAvecPhotos[];
    onUpdateStatus: (id: string, statut: 'disponible' | 'en_cours' | 'loue') => void;
    onDeleteProperty: (id: string) => void;
}

export default function MyPropertiesSection({ properties, onUpdateStatus, onDeleteProperty }: MyPropertiesSectionProps) {

    if (!properties || properties.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.sectionTitle}>Mes Annonces</Text>
                </View>
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🏠</Text>
                    <Text style={styles.emptyText}>Vous n'avez pas encore d'annonce</Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/post/media')}>
                        <Text style={styles.primaryBtnText}>Publier ma première annonce</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const displayProps = properties.slice(0, 3);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Mes Annonces</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/post/media')}>
                    <Text style={styles.addBtnText}>+ Ajouter</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                {displayProps.map(prop => (
                    <PropertyListItem
                        key={prop.id_propriete}
                        property={prop}
                        onUpdateStatus={onUpdateStatus}
                        onDeleteProperty={onDeleteProperty}
                    />
                ))}
            </View>

            {properties.length > 3 && (
                <TouchableOpacity style={styles.viewAllBtn} onPress={() => router.push('/my-properties')}>
                    <Text style={styles.viewAllBtnText}>Voir toutes mes annonces ({properties.length})</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const PropertyListItem = ({ property, onUpdateStatus, onDeleteProperty }: any) => {
    const handleMenuPress = () => {
        Alert.alert(
            "Gérer l'annonce",
            property.titre,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: property.statut === 'disponible' ? "Marquer comme Loué" : "Marquer comme Disponible",
                    onPress: () => onUpdateStatus(property.id_propriete, property.statut === 'disponible' ? 'loue' : 'disponible')
                },
                {
                    text: "Supprimer l'annonce",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert("Confirmer", "Supprimer définitivement ?", [
                            { text: "Non", style: "cancel" },
                            { text: "Oui, supprimer", style: "destructive", onPress: () => onDeleteProperty(property.id_propriete) }
                        ]);
                    }
                }
            ]
        );
    };

    const getStatusColor = (statut: string) => {
        switch (statut) {
            case 'disponible': return COLORS.secondary;
            case 'en_cours': return COLORS.warning;
            case 'loue': return COLORS.danger;
            default: return COLORS.textSecondary;
        }
    };

    return (
        <View style={styles.listItem}>
            <Image
                source={{ uri: property.photos?.[0]?.url_photo || 'https://via.placeholder.com/56' }}
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.itemTitle} numberOfLines={1}>{property.titre}</Text>
                <Text style={styles.itemMeta}>📍 {(property.quartier as any)?.nom_quartier || 'Inconnu'}  •  {formatPrix(property.prix_mensuel)}/mois</Text>
                <View style={styles.statusRow}>
                    <Text style={styles.itemMeta}>Statut: {property.statut.charAt(0).toUpperCase() + property.statut.slice(1)}</Text>
                </View>
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <MaterialIcons name="circle" size={12} color={getStatusColor(property.statut)} style={{ marginBottom: 16 }} />
                <TouchableOpacity onPress={handleMenuPress} style={{ padding: 4 }}>
                    <MaterialIcons name="more-vert" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.md,
        marginVertical: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    addBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS.md,
    },
    addBtnText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: SPACING.md,
    },
    emptyText: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    primaryBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: BORDER_RADIUS.md,
    },
    primaryBtnText: {
        color: COLORS.surface,
        fontWeight: '600',
    },
    listContainer: {
        gap: SPACING.sm,
    },
    listItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: BORDER_RADIUS.sm,
    },
    infoContainer: {
        flex: 1,
        marginLeft: SPACING.sm,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    itemMeta: {
        fontSize: TYPOGRAPHY.fontSizeXS,
        color: COLORS.textSecondary,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    viewAllBtn: {
        marginTop: SPACING.sm,
        alignItems: 'center',
        paddingVertical: SPACING.sm,
    },
    viewAllBtnText: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.fontSizeSM,
        fontWeight: '500',
    }
});
