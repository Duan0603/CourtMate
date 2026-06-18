import React from 'react';
import { Text, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMockData } from '@/hooks/useMockData';
import { SPORTS_LIST } from '@/constants/MockData';
import { ArrowRight, Star, Flame, Navigation, Bell, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { 
    venues,
    selectedSportFilter, 
    setSelectedSportFilter,
  } = useMockData();

  const router = useRouter();

  const handleFindTeammates = () => {
    router.push('/map');
  };

  const handleSportClick = (sportId: any) => {
    setSelectedSportFilter(sportId);
    router.push('/booking');
  };

  const handleVenueClick = (sportId: any) => {
    setSelectedSportFilter(sportId);
    router.push('/booking');
  };

  const formatPrice = (p: number) => {
    return (p / 1000) + 'k';
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      {/* Upper Status bar subheader */}
      <View className="px-[16px] py-[12px] flex-row items-center justify-between border-b border-borderGray bg-secondary">
        <View className="flex-row items-center gap-2 flex-1">
          <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center">
            <MapPin size={16} color="#39FF14" />
          </View>
          <View className="flex-col flex-1">
            <Text className="text-[10px] text-textGray font-bold uppercase tracking-wider">Vị trí hiện tại</Text>
            <Text className="text-xs font-semibold text-white max-w-[160px]" numberOfLines={1}>
              Hẻm 285 CMT8, Quận 10, TP.HCM
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          className="relative w-8 h-8 rounded-full bg-background border border-borderGray items-center justify-center"
          activeOpacity={0.7}
        >
          <Bell size={16} color="#8E8E93" />
          <View className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero promo card */}
        <View className="mx-[16px] mt-[16px] p-[16px] rounded-2xl bg-gradient-to-r from-accent/20 to-emerald-500/10 border border-accent/20 relative overflow-hidden">
          <View className="relative z-10">
            <View className="flex-row items-center bg-accent rounded-full px-2 py-0.5 self-start mb-2">
              <Flame size={10} color="#000000" style={{ marginRight: 2 }} />
              <Text className="text-[9px] font-bold text-black uppercase">ĐIỂM THƯỞNG x2</Text>
            </View>
            <Text className="text-sm font-bold text-white mb-1">Giờ vàng đặt sân</Text>
            <Text className="text-[11px] text-textGray">
              Hoàn tiền 20% khi rủ nhóm chơi thành công khung giờ 17:00 - 20:00!
            </Text>
          </View>
        </View>

        {/* Main Big Thumb Dashboard Area */}
        <View className="px-[16px] mt-[20px] items-center">
          <View className="w-full bg-secondary border border-borderGray rounded-3xl p-[24px] items-center relative overflow-hidden">
            <Text className="text-base font-bold text-white tracking-tight mb-1 text-center">
              Thiếu đồng đội thi đấu?
            </Text>
            <Text className="text-xs text-textGray mb-[24px] text-center max-w-[240px]">
              Tìm người chơi cùng trình độ xung quanh ngay lập tức theo mô hình On-Demand
            </Text>

            {/* GIANT BUTTON - THUMB ZONE CENTRAL DESIGN */}
            <View className="relative mb-[20px] items-center justify-center">
              {/* Pulsing ring background */}
              <View className="absolute w-[160px] h-[160px] bg-accent/5 rounded-full" />
              <View className="absolute w-[144px] h-[144px] bg-accent/10 rounded-full" />
              
              <TouchableOpacity 
                onPress={handleFindTeammates}
                className="w-[128px] h-[128px] rounded-full bg-accent items-center justify-center p-3 shadow-lg shadow-accent/25"
                activeOpacity={0.85}
              >
                <View className="w-8 h-8 rounded-full bg-black/10 items-center justify-center mb-1">
                  <Navigation size={16} color="#000000" style={{ transform: [{ rotate: '45deg' }] }} />
                </View>
                <Text className="text-center font-black text-black leading-tight text-xs tracking-wider">
                  TÌM BẠN{"\n"}
                  <Text className="text-lg font-black">NGAY</Text>
                </Text>
                <Text className="text-[9px] text-black/80 font-semibold mt-1">Hỗ trợ 5 môn</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center gap-2 bg-background border border-borderGray rounded-full py-1.5 px-4">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-[11px] text-textGray">
                Đang có <Text className="text-accent font-bold">83</Text> người chơi sẵn sàng ghép kèo
              </Text>
            </View>
          </View>
        </View>

        {/* Horizontal Sports Scrolling Category */}
        <View className="mt-[24px]">
          <View className="px-[16px] flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-1.5">
              <View className="w-[6px] h-3 bg-accent rounded-sm" />
              <Text className="text-xs font-bold text-slate-350 uppercase tracking-widest">Danh mục Thể Thao</Text>
            </View>
            <Text className="text-[11px] text-textGray">Vuốt ngang ➔</Text>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {SPORTS_LIST.map((sport) => (
              <TouchableOpacity
                key={sport.id}
                onPress={() => handleSportClick(sport.id)}
                className="flex-col items-center justify-center w-[96px] h-[96px] rounded-2xl bg-secondary border border-borderGray p-3"
                activeOpacity={0.7}
              >
                <Text className="text-2xl mb-2">{sport.emoji}</Text>
                <Text className="text-xs font-medium text-slate-300 text-center truncate w-full">{sport.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Suggested Venues Quick List */}
        <View className="mt-[24px] px-[16px]">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-1.5">
              <View className="w-[6px] h-3 bg-accent rounded-sm" />
              <Text className="text-xs font-bold text-slate-350 uppercase tracking-widest">Sân gần bạn có slot trống</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/booking')}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-[11px] text-accent font-semibold mr-0.5">Tất cả</Text>
              <ArrowRight size={10} color="#39FF14" />
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {/* Sân 1 */}
            <TouchableOpacity 
              onPress={() => handleVenueClick('badminton')}
              className="flex-row items-center gap-3 p-3 bg-secondary/40 border border-borderGray/40 rounded-xl"
              activeOpacity={0.8}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=150' }} className="w-16 h-16 rounded-lg" />
              <View className="flex-1 min-w-0">
                <Text className="text-xs font-bold text-white truncate">Sân Cầu Lông Viettel Hẻm 285</Text>
                <Text className="text-[10px] text-textGray truncate mt-0.5">Hẻm 285 Cách Mạng Tháng Tám, Q10</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View className="flex-row items-center gap-0.5">
                    <Star size={10} color="#FFD700" fill="#FFD700" />
                    <Text className="text-[10px] text-slate-300 font-semibold">4.8</Text>
                  </View>
                  <Text className="text-[10px] text-textGray">•</Text>
                  <Text className="text-[10px] text-accent font-semibold">Cách 0.8km</Text>
                </View>
              </View>
              <View className="items-end justify-center">
                <Text className="text-[10px] text-textGray">Chỉ từ</Text>
                <Text className="text-xs font-bold text-accent">80k<Text className="text-[8px] text-textGray">/h</Text></Text>
              </View>
            </TouchableOpacity>

            {/* Sân 2 */}
            <TouchableOpacity 
              onPress={() => handleVenueClick('soccer')}
              className="flex-row items-center gap-3 p-3 bg-secondary/40 border border-borderGray/40 rounded-xl"
              activeOpacity={0.8}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150' }} className="w-16 h-16 rounded-lg" />
              <View className="flex-1 min-w-0">
                <Text className="text-xs font-bold text-white truncate">Sân Bóng Đá Kỳ Hòa Landmark</Text>
                <Text className="text-[10px] text-textGray truncate mt-0.5">Sư Vạn Hạnh, Phường 12, Q10</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <View className="flex-row items-center gap-0.5">
                    <Star size={10} color="#FFD700" fill="#FFD700" />
                    <Text className="text-[10px] text-slate-300 font-semibold">4.9</Text>
                  </View>
                  <Text className="text-[10px] text-textGray">•</Text>
                  <Text className="text-[10px] text-accent font-semibold">Cách 1.2km</Text>
                </View>
              </View>
              <View className="items-end justify-center">
                <Text className="text-[10px] text-textGray">Chỉ từ</Text>
                <Text className="text-xs font-bold text-accent">350k<Text className="text-[8px] text-textGray">/h</Text></Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
