import React, { useMemo } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { MapPin, Star, Calendar, Users, X, Award } from 'lucide-react-native';
import { useMockData } from '@/hooks/useMockData';
import { Venue, MatchKeo } from '@/types';

interface MatchBottomSheetProps {
  sheetRef: React.RefObject<BottomSheet | null>;
  selectedVenue: Venue | null;
  onClose?: () => void;
  onJoinSuccess: (match: MatchKeo) => void;
}

export default function MatchBottomSheet({
  sheetRef,
  selectedVenue,
  onClose,
  onJoinSuccess,
}: MatchBottomSheetProps) {
  const { keos, joinedMatchIds, toggleJoinKeo } = useMockData();

  // Snap points: 20% (peek), 55% (details)
  const snapPoints = useMemo(() => ['20%', '55%'], []);

  if (!selectedVenue) {
    return null;
  }

  // Filter keos at this venue
  const activeMatches = keos.filter(k => k.venueName === selectedVenue.name);

  const handleToggleJoin = (keo: MatchKeo) => {
    const isJoined = joinedMatchIds.includes(keo.id);
    if (isJoined) {
      Alert.alert(
        'Hủy tìm kiếm',
        'Bạn có chắc chắn muốn hủy tìm đồng đội? Kèo hiện tại sẽ bị xóa khỏi lịch trình.',
        [
          { text: 'Quay lại', style: 'cancel' },
          { 
            text: 'Xác nhận hủy', 
            style: 'destructive',
            onPress: () => {
              toggleJoinKeo(keo.id);
            }
          }
        ]
      );
    } else {
      toggleJoinKeo(keo.id);
      onJoinSuccess(keo);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={1}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: '#2C2C2E',
      }}
      handleIndicatorStyle={{
        backgroundColor: '#8E8E93',
        width: 40,
        height: 4,
      }}
      enablePanDownToClose={false}
    >
      <BottomSheetView className="flex-1 px-5 pt-2">
        {/* Header Section */}
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-white text-base font-bold" numberOfLines={1}>
              {selectedVenue.name}
            </Text>
            <View className="flex-row items-center mt-1">
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text className="text-yellow-400 text-xs font-semibold ml-1">{selectedVenue.rating}</Text>
              <Text className="text-textGray mx-1.5">•</Text>
              <Text className="text-textGray text-xs">Cách {selectedVenue.distance} km</Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity 
              className="w-7 h-7 rounded-full bg-background border border-borderGray justify-center items-center" 
              onPress={onClose} 
              activeOpacity={0.7}
            >
              <X size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Address and details */}
        <View className="flex-row items-center gap-1.5 mb-4 pb-3 border-b border-borderGray">
          <MapPin size={12} color="#8E8E93" />
          <Text className="text-textGray text-xs flex-1" numberOfLines={1}>
            {selectedVenue.address}
          </Text>
        </View>

        {/* Matches Section Scrollable */}
        <BottomSheetScrollView 
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-xs font-bold uppercase tracking-wider mb-3">
            Các kèo đang chờ ghép
          </Text>

          {activeMatches.length > 0 ? (
            activeMatches.map((match) => {
              const isJoined = joinedMatchIds.includes(match.id);
              
              return (
                <View 
                  key={match.id} 
                  className="bg-background border border-borderGray rounded-2xl p-4 mb-3 relative overflow-hidden"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-white text-xs font-bold flex-1 mr-2">{match.title}</Text>
                    <View className="bg-secondary px-2 py-0.5 rounded-lg flex-row items-center gap-0.5">
                      <Award size={10} color="#39FF14" />
                      <Text className="text-white text-[9px] font-semibold">{match.level}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mb-2.5">
                    <Text className="text-textGray text-xs">Trưởng nhóm: </Text>
                    <Text className="text-white text-xs font-semibold">{match.hostName}</Text>
                  </View>

                  <View className="flex-row gap-4 mb-3">
                    <View className="flex-row items-center gap-1.5">
                      <Calendar size={12} color="#8E8E93" />
                      <Text className="text-textGray text-xs">{match.timeSlot}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Users size={12} color="#8E8E93" />
                      <Text className="text-textGray text-xs">
                        Sĩ số: {isJoined ? 4 - match.missingPlayers + 1 : 4 - match.missingPlayers}/4
                      </Text>
                    </View>
                  </View>

                  {/* One-touch Join/Cancel Button */}
                  <TouchableOpacity
                    className={`w-full h-11 rounded-2xl justify-center items-center mt-1 active:scale-95 ${
                      isJoined ? 'bg-destructive' : 'bg-accent'
                    }`}
                    onPress={() => handleToggleJoin(match)}
                    activeOpacity={0.85}
                  >
                    <Text className={`text-xs font-bold tracking-wider ${
                      isJoined ? 'text-white' : 'text-black'
                    }`}>
                      {isJoined ? 'HỦY KÈO CHỜ' : 'THAM GIA NGAY (1 CHẠM)'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View className="py-6 items-center">
              <Text className="text-textGray text-xs">Hiện chưa có kèo đấu nào tại địa điểm này.</Text>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
