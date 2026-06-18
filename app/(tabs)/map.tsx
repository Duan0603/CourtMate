import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import { Compass, RefreshCw, Layers } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useMockData, Arena } from '@/hooks/useMockData';
import MatchRadar from '@/components/Map/MatchRadar';
import MatchBottomSheet from '@/components/Map/MatchBottomSheet';

export default function MapScreen() {
  const { userLocation, arenas } = useMockData();
  const [selectedArena, setSelectedArena] = useState<Arena | null>(arenas[0]); // default to first arena to show bottom sheet
  const [joinedMatchIds, setJoinedMatchIds] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  
  const mapRef = useRef<MapView>(null);
  const sheetRef = useRef<BottomSheet>(null);

  // Focus map on user location on mount
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  }, []);

  const handleArenaPress = (arena: Arena) => {
    setSelectedArena(arena);
    // Expand bottom sheet to peek or details
    sheetRef.current?.snapToIndex(1); // open to index 1 (55% height)
    
    // Focus map on selected arena
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...arena.location,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 600);
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 800);
    }
  };

  const handleToggleJoin = (matchId: string) => {
    const isJoined = joinedMatchIds.includes(matchId);
    
    if (isJoined) {
      // Show destructive confirmation as per copywriting contract in UI-SPEC.md
      Alert.alert(
        'Hủy tìm kiếm',
        'Bạn có chắc chắn muốn hủy tìm đồng đội? Kèo hiện tại sẽ bị xóa.',
        [
          { text: 'Quay lại', style: 'cancel' },
          { 
            text: 'Xác nhận hủy', 
            style: 'destructive',
            onPress: () => {
              setJoinedMatchIds(prev => prev.filter(id => id !== matchId));
            }
          }
        ]
      );
    } else {
      // Join match
      setJoinedMatchIds(prev => [...prev, matchId]);
      Alert.alert('Thành công', 'Bạn đã đăng ký tham gia kèo đấu chờ. Hệ thống sẽ thông báo khi đủ thành viên.');
    }
  };

  const handleCloseSheet = () => {
    // Minimize sheet instead of closing completely so user can still see there is a card
    sheetRef.current?.snapToIndex(0); // minimize to index 0 (20% height)
  };

  return (
    <View style={styles.container}>
      {/* Full screen Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={false} // We show custom radar marker instead
        showsMyLocationButton={false}
      >
        {/* User Location Radar Marker */}
        {isScanning && (
          <Marker 
            coordinate={userLocation} 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={2}
          >
            <MatchRadar size={130} />
          </Marker>
        )}

        {/* Arenas Markers */}
        {arenas.map((arena) => {
          const isSelected = selectedArena?.id === arena.id;
          return (
            <Marker
              key={arena.id}
              coordinate={arena.location}
              onPress={() => handleArenaPress(arena)}
              zIndex={isSelected ? 10 : 1}
            >
              <View style={[
                styles.markerBubble,
                isSelected && styles.markerBubbleSelected
              ]}>
                <Text style={[
                  styles.markerText,
                  isSelected && styles.markerTextSelected
                ]}>
                  {arena.name.split(' ').slice(-1)[0]} {/* Show last word of arena name */}
                </Text>
                <View style={[
                  styles.markerArrow,
                  isSelected && styles.markerArrowSelected
                ]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingControls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleRecenter}
          activeOpacity={0.7}
        >
          <Compass size={22} color={Colors.dark.text} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setIsScanning(prev => !prev)}
          activeOpacity={0.7}
        >
          <RefreshCw 
            size={22} 
            color={isScanning ? Colors.dark.accent : Colors.dark.textGray} 
          />
        </TouchableOpacity>
      </View>

      {/* Radar scanning indicator overlay */}
      {isScanning && (
        <View style={styles.scanningToast}>
          <View style={styles.scanningDot} />
          <Text style={styles.scanningText}>Đang quét tìm đối thủ lân cận...</Text>
        </View>
      )}

      {/* Interactive Bottom Sheet */}
      <MatchBottomSheet
        sheetRef={sheetRef}
        selectedArena={selectedArena}
        joinedMatchIds={joinedMatchIds}
        onToggleJoin={handleToggleJoin}
        onClose={handleCloseSheet}
      />
    </View>
  );
}

// Sleek Dark Theme style array for MapView
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "poi.park", "elementType": "labels.text.stroke", "stylers": [{ "color": "#1b1b1b" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#373737" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#4e4e4e" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  floatingControls: {
    position: 'absolute',
    top: 50,
    right: 16,
    gap: 12,
    zIndex: 5,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  scanningToast: {
    position: 'absolute',
    top: 54,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    zIndex: 5,
  },
  scanningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.accent,
    marginRight: 8,
    // Add pulsing state or color
  },
  scanningText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
  },
  markerBubble: {
    backgroundColor: Colors.dark.secondary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  markerBubbleSelected: {
    borderColor: Colors.dark.accent,
    backgroundColor: Colors.dark.background,
  },
  markerText: {
    color: Colors.dark.textGray,
    fontSize: 11,
    fontWeight: 'bold',
  },
  markerTextSelected: {
    color: Colors.dark.accent,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.dark.border,
    position: 'absolute',
    bottom: -5,
    alignSelf: 'center',
  },
  markerArrowSelected: {
    borderTopColor: Colors.dark.accent,
  },
});
