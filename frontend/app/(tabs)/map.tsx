import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import { Compass, RefreshCw, Check, Navigation } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useMockData } from '@/hooks/useMockData';
import { Venue, MatchKeo } from '@/types';
import MatchRadar from '@/components/Map/MatchRadar';
import MatchBottomSheet from '@/components/Map/MatchBottomSheet';

export default function MapScreen() {
  const { userLocation, venues, keos } = useMockData();
  const router = useRouter();

  // State
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venues[0]);
  const [isScanning, setIsScanning] = useState(true);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [joinedMatch, setJoinedMatch] = useState<MatchKeo | null>(null);

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

  // Auto scanning countdown of 3 seconds on mount or refresh
  useEffect(() => {
    let timer: any;
    if (isScanning) {
      timer = setTimeout(() => {
        setIsScanning(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [isScanning]);

  const handleVenuePress = (venue: Venue) => {
    setSelectedVenue(venue);
    // Expand bottom sheet to details
    sheetRef.current?.snapToIndex(1); // Open to index 1 (55% height)
    
    // Focus map on selected venue
    if (mapRef.current && venue.location) {
      mapRef.current.animateToRegion({
        ...venue.location,
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

  const handleCloseSheet = () => {
    sheetRef.current?.snapToIndex(0); // Minimize to index 0 (20% height)
  };

  const handleRefreshRadar = () => {
    setIsScanning(true);
  };

  const handleJoinSuccess = (match: MatchKeo) => {
    setJoinedMatch(match);
    setShowSuccessSplash(true);
    
    // Transition to chat screen after 2 seconds
    setTimeout(() => {
      setShowSuccessSplash(false);
      router.push('/chat');
    }, 2000);
  };

  // Get sport emoji
  const getSportEmoji = (sport: string) => {
    switch (sport) {
      case 'badminton': return '🏸';
      case 'soccer': return '⚽';
      case 'basketball': return '🏀';
      case 'tennis': return '🎾';
      case 'tabletennis': return '🏓';
      default: return '⚽';
    }
  };

  return (
    <View className="flex-1 bg-black">
      {/* Full screen Map */}
      <MapView
        ref={mapRef}
        className="flex-1"
        provider={PROVIDER_DEFAULT}
        customMapStyle={darkMapStyle}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={false}
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

        {/* User static custom marker when NOT scanning */}
        {!isScanning && (
          <Marker 
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={3}
          >
            <View className="relative items-center justify-center">
              <View className="w-6 h-6 rounded-full bg-accent border-2 border-[#121212] items-center justify-center shadow-lg shadow-accent/40">
                <View className="w-2 h-2 rounded-full bg-black" />
              </View>
              {/* Floating mini-banner */}
              <View className="absolute top-7 bg-accent px-2 py-0.5 rounded-full flex-row items-center gap-1 shadow-md whitespace-nowrap min-w-[70px]">
                <View className="w-1 h-1 rounded-full bg-destructive animate-pulse" />
                <Text className="text-[8px] font-black text-black uppercase">Bạn tại đây</Text>
              </View>
            </View>
          </Marker>
        )}

        {/* Venues Markers (Only show if not scanning) */}
        {!isScanning && venues.map((venue) => {
          if (!venue.location) return null;
          const isSelected = selectedVenue?.id === venue.id;
          return (
            <Marker
              key={venue.id}
              coordinate={venue.location}
              onPress={() => handleVenuePress(venue)}
              zIndex={isSelected ? 10 : 1}
            >
              <View className="items-center justify-center">
                <View className={`py-1.5 px-2.5 rounded-xl border border-solid items-center justify-center shadow-md ${
                  isSelected ? 'border-accent bg-background' : 'border-borderGray bg-secondary'
                }`}>
                  <Text className={`text-[10px] font-bold ${
                    isSelected ? 'text-accent' : 'text-textGray'
                  }`}>
                    {venue.name.split(' ').slice(-1)[0]}
                  </Text>
                </View>
                {/* Arrow indicator */}
                <View className={`w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent ${
                  isSelected ? 'border-t-accent' : 'border-t-borderGray'
                }`} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Action Buttons */}
      <View className="absolute top-12 right-4 gap-3 z-10">
        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-[#1C1C1E]/90 justify-center items-center border border-borderGray shadow-md"
          onPress={handleRecenter}
          activeOpacity={0.7}
        >
          <Compass size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-11 h-11 rounded-full bg-[#1C1C1E]/90 justify-center items-center border border-borderGray shadow-md"
          onPress={handleRefreshRadar}
          activeOpacity={0.7}
        >
          <RefreshCw 
            size={20} 
            color={isScanning ? '#39FF14' : '#8E8E93'} 
          />
        </TouchableOpacity>
      </View>

      {/* Radar scanning indicator overlay */}
      {isScanning && (
        <View className="absolute top-12 left-4 flex-row items-center bg-[#1C1C1E]/95 py-2.5 px-4 rounded-full border border-borderGray z-10">
          <View className="w-2 h-2 rounded-full bg-accent mr-2" />
          <Text className="text-white text-xs font-bold">Đang quét tìm đối thủ lân cận...</Text>
        </View>
      )}

      {/* Interactive Bottom Sheet */}
      <MatchBottomSheet
        sheetRef={sheetRef}
        selectedVenue={selectedVenue}
        onClose={handleCloseSheet}
        onJoinSuccess={handleJoinSuccess}
      />

      {/* SUCCESS SPLASH OVERLAY */}
      {showSuccessSplash && (
        <View className="absolute inset-0 bg-[#121212]/95 backdrop-blur-md justify-center items-center p-6 z-50">
          <View className="w-20 h-20 rounded-full bg-accent items-center justify-center shadow-xl shadow-accent/30 mb-6">
            <Check size={40} color="#000000" strokeWidth={4} />
          </View>

          <Text className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">
            Ghép kèo thành công!
          </Text>
          
          <Text className="text-base font-black text-white text-center max-w-[240px] leading-snug mb-2">
            Đã tham gia nhóm {joinedMatch?.hostName}
          </Text>

          <Text className="text-xs text-textGray text-center max-w-[200px]">
            Đang chuyển hướng sang hộp thư chat nhóm thể thao để chia kèo...
          </Text>
        </View>
      )}
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
