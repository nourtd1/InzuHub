import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { GISENYI_POI } from '../../constants/gisenyi_poi';
import { COLORS, BORDER_RADIUS } from '../../constants/theme';

interface POIMarkerProps {
    poi: typeof GISENYI_POI[0];
}

export default function POIMarker({ poi }: POIMarkerProps) {
    return (
        <Marker
            coordinate={{ latitude: poi.lat, longitude: poi.lng }}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
            // Interactivity disabled as requested
            tappable={false}
        >
            <View style={styles.container}>
                <Text style={styles.emoji}>{poi.emoji}</Text>
            </View>
        </Marker>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 36,
        height: 36,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
    },
    emoji: {
        fontSize: 18,
    },
});
