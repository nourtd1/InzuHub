import React, { useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Photo } from '../../types/database.types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const HEIGHT = 300;

interface PhotoGalleryProps {
    photos: Photo[];
    propertyTitle: string;
}

export default function PhotoGallery({ photos, propertyTitle }: PhotoGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    }).current;

    const renderPhoto = ({ item }: { item: Photo }) => (
        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsModalVisible(true)}>
            <Image
                source={{ uri: item.url_photo }}
                style={styles.image}
                contentFit="cover"
                transition={300}
            />
        </TouchableOpacity>
    );

    const renderModalPhoto = ({ item }: { item: Photo }) => (
        <View style={styles.modalImageContainer}>
            <Image
                source={{ uri: item.url_photo }}
                style={styles.modalImage}
                contentFit="contain"
            />
        </View>
    );

    if (!photos || photos.length === 0) {
        return (
            <View style={[styles.image, styles.placeholder]}>
                <MaterialIcons name="home" size={48} color={COLORS.surface} />
                <Text style={styles.placeholderText}>Aucune photo disponible</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={photos}
                keyExtractor={(item) => item.id_photo}
                renderItem={renderPhoto}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.gradient}
            />

            {photos.length > 1 && (
                <View style={styles.paginationContainer}>
                    {photos.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === currentIndex ? COLORS.surface : 'rgba(255,255,255,0.4)' }
                            ]}
                        />
                    ))}
                </View>
            )}

            {photos.length > 1 && (
                <View style={styles.badgeContainer}>
                    <MaterialIcons name="photo-camera" size={14} color={COLORS.surface} />
                    <Text style={styles.badgeText}>{photos.length} photos</Text>
                </View>
            )}

            {/* Modal de vue plein écran */}
            <Modal
                visible={isModalVisible}
                transparent={false}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsModalVisible(false)}
                    >
                        <MaterialIcons name="close" size={28} color={COLORS.surface} />
                    </TouchableOpacity>

                    <FlatList
                        data={photos}
                        keyExtractor={(item) => item.id_photo}
                        renderItem={renderModalPhoto}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        initialScrollIndex={currentIndex}
                        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                    />

                    <View style={styles.modalFooter}>
                        <Text style={styles.modalTitle}>{propertyTitle}</Text>
                        <Text style={styles.modalSubtitle}>
                            {currentIndex + 1} / {photos.length}
                        </Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: HEIGHT,
        width: width,
        position: 'relative',
    },
    image: {
        width: width,
        height: HEIGHT,
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    paginationContainer: {
        position: 'absolute',
        bottom: SPACING.md,
        flexDirection: 'row',
        alignSelf: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    badgeContainer: {
        position: 'absolute',
        bottom: SPACING.md,
        right: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: BORDER_RADIUS.md,
    },
    badgeText: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeXS,
        fontWeight: 'bold',
        marginLeft: 4,
    },
    placeholder: {
        backgroundColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: COLORS.surface,
        marginTop: SPACING.sm,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: SPACING.lg,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImageContainer: {
        width: width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: width,
        height: '80%',
    },
    modalFooter: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    modalTitle: {
        color: COLORS.surface,
        fontSize: TYPOGRAPHY.fontSizeMD,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    modalSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: TYPOGRAPHY.fontSizeSM,
    },
});
