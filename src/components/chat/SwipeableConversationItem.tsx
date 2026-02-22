import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = -80;
const ACTION_WIDTH = 80;

interface SwipeableConversationItemProps {
    children: React.ReactNode;
    onDelete: () => void;
}

export default function SwipeableConversationItem({ children, onDelete }: SwipeableConversationItemProps) {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only enable pan if user swipes horizontally significantly
                return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
            },
            onPanResponderMove: (_, gestureState) => {
                // Only allow swiping to the left
                if (gestureState.dx < 0) {
                    pan.setValue({ x: gestureState.dx, y: 0 });
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < SWIPE_THRESHOLD) {
                    // Open background fully
                    Animated.spring(pan, {
                        toValue: { x: -ACTION_WIDTH, y: 0 },
                        useNativeDriver: true,
                        bounciness: 0,
                    }).start();
                } else {
                    // Snap back
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    const handleDelete = () => {
        Alert.alert(
            "Supprimer la conversation",
            "Cette action supprimera tous les messages. Cette action est irréversible.",
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                    onPress: () => {
                        Animated.spring(pan, {
                            toValue: { x: 0, y: 0 },
                            useNativeDriver: true,
                        }).start();
                    }
                },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        // Slide out animation
                        Animated.timing(pan, {
                            toValue: { x: -width, y: 0 },
                            duration: 200,
                            useNativeDriver: true,
                        }).start(() => {
                            onDelete();
                        });
                    }
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.background}>
                <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
                    <MaterialIcons name="delete" size={24} color={COLORS.surface} />
                </TouchableOpacity>
            </View>
            <Animated.View
                style={[styles.foreground, { transform: [{ translateX: pan.x }] }]}
                {...panResponder.panHandlers}
            >
                {children}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        position: 'relative',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.danger,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    deleteAction: {
        width: ACTION_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    foreground: {
        backgroundColor: COLORS.surface,
    }
});
