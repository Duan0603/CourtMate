import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert, RefreshControl, ImageBackground, TextInput, Platform } from 'react-native';
import { Bell, Trophy, Award, BarChart2, MapPin, Target, CircleDashed, Tent, Activity, Search, Filter } from 'lucide-react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import gsap from 'gsap';
import { Tournament, TournamentFilterDto } from '@courtmate/shared';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { useLogin } from '../../auth/hooks/useLogin';
import { Typography } from '../../../components/ui/Typography';

const MOCK_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuArez7FVbKq5AXqkApxwHxYI7TURW1Za6wqiRbH8z3EwBi362I_Pazy1fY8OLiRss_3_AceDOV1NQD_4ir1snZvipUE2FlbVS8Re9QflNCq7ADu6HYFBECMCMGHiyRvMPvE0S9AGP6hF5lzcyGOroQ6Gf4DplC1mFzCDPxEyhXy_PjWFgtvOBQBt64ug9Qeir06hFmOxd4gSvJ6VfP3AE64Q9jVm72Rz2n67v_O8-oNMg65vRczA8tfaA';

export const MOCK_ACTIVE_TOURNAMENTS = [
  {
    id: 'mock-1',
    title: 'Elite Clay Masters 2024',
    sport: 'Quần vợt',
    location: 'Metropolis Arena',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoY5nKXn8iyFasSan28EPjlpKl3z7A6cnA8pSkxncCStGFv2u2qf-4zghPcY7a1S5R4V3C8KD0a1c6-7SrmPyjVMH7W4XICudrVaBegXJ2iwo2V49eqBR_azaPKRBc1AZHfmWD-vM0EmWQx-3cci-hezgCDjIwnvepFRSBMEn-KKLGL5E21cNvDBaoOS6DJm039vuGMTvD8z_yNgKwddkc13m9UVfhKi9HBg9u40axJ6VutmG4c0heQQ',
    isLive: true,
  },
  {
    id: 'mock-2',
    title: 'Pro City Hoop Series',
    sport: 'Bóng rổ',
    location: 'Skyline Sports Complex',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7UIMGG-jpTsAToMYbOAH_UhBwpYod_WDTAwLMuQytZC_HpOaGINzC0wwmZQFB2uzXQcBKJJq9xk7cPWFeyqN7K9Q83EOuVsqkDsn1guht2GpGWm-iWWuvY5Wzloc9otvJR9mTrYA91be8G7xOkWLwqTk-fDBg5E6Vf7rs3hJtihLnoJIbhw3sqX7o6mYU7zgRUhLXaDBNRWZKR4fSDi1iEC73dQ-1o75QaHSXdtyjmJEWSAoeGciZyA',
    isLive: true,
  }
];

export const MOCK_RECOMMENDED = [
  {
    id: 'rec-1',
    title: 'Regional Padel Open',
    sport: 'Quần vợt',
    date: '12 Thg 10',
    info: '48 Người chơi',
    status: 'Đã tham gia',
  },
  {
    id: 'rec-2',
    title: 'Midnight Futsal Cup',
    sport: 'Bóng đá',
    date: '15 Thg 10',
    info: '16 Đội',
    status: 'Tham gia',
  },
  {
    id: 'rec-3',
    title: 'Beach Spike Jam',
    sport: 'Bóng chuyền',
    date: '20 Thg 10',
    info: '32 Người chơi',
    status: 'Tham gia',
  },
  {
    id: 'rec-4',
    title: 'Green Valley Invitational',
    sport: 'Golf',
    date: '28 Thg 10',
    info: '72 Người chơi',
    status: 'Danh sách chờ',
  }
];

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
}

export const DashboardScreen: React.FC = () => {
  const { user } = useLogin();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joinedTournaments, setJoinedTournaments] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const isFocused = useIsFocused();
  const containerRef = useRef<View>(null);
  const headerRef = useRef<View>(null);

  useEffect(() => {
    if (isFocused && Platform.OS === 'web' && headerRef.current) {
      // Start with transparent header
      gsap.set(headerRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderBottomColor: 'rgba(124, 116, 122, 0)',
        boxShadow: 'none'
      });
    }
  }, [isFocused]);

  useEffect(() => {
    if (isFocused && Platform.OS === 'web' && containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [isFocused]);

  const city = user?.preferences?.location || 'Da Nang';

  const loadTournaments = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const response = await tournamentsApi.getTournaments({ city } as TournamentFilterDto);
      setTournaments(response.data ?? []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [city]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  // Character by character search filtering
  const filteredActiveTournaments = useMemo(() => {
    return MOCK_ACTIVE_TOURNAMENTS.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredRecommendedTournaments = useMemo(() => {
    const rawList = tournaments.length > 0 ? tournaments.map(t => ({
      id: t.id || (t as any)._id,
      title: t.title,
      sport: t.sport,
      date: formatDate(t.startDate),
      info: t.location || city,
      status: 'Tham gia'
    })) : MOCK_RECOMMENDED;

    return rawList.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.info.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tournaments, city]);

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (Platform.OS === 'web' && headerRef.current) {
      if (scrollY > 10) {
        gsap.to(headerRef.current, {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderBottomColor: 'rgba(124, 116, 122, 0.15)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          duration: 0.3,
          overwrite: 'auto'
        });
      } else {
        gsap.to(headerRef.current, {
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderBottomColor: 'rgba(124, 116, 122, 0)',
          boxShadow: 'none',
          duration: 0.3,
          overwrite: 'auto'
        });
      }
    }
  };

  const handleJoin = (id: string) => {
    setJoinedTournaments(prev => ({ ...prev, [id]: true }));
    Alert.alert('Thành công', 'Bạn đã đăng ký giải đấu này!');
  };

  const renderIcon = (sport: string, color: string) => {
    switch (sport?.toLowerCase()) {
      case 'tennis':
      case 'quần vợt': return <Target color={color} size={32} />;
      case 'football':
      case 'bóng đá': return <Activity color={color} size={32} />;
      case 'basketball':
      case 'bóng rổ': return <CircleDashed color={color} size={32} />;
      case 'volleyball':
      case 'bóng chuyền': return <Tent color={color} size={32} />;
      default: return <Target color={color} size={32} />;
    }
  };

  // Combine real API tournaments with mock ones for a full UI experience
  const displayList = tournaments.length > 0 ? tournaments.map(t => ({
    id: t.id || (t as any)._id,
    title: t.title,
    sport: t.sport,
    date: formatDate(t.startDate),
    info: t.location || city,
    status: 'Tham gia'
  })) : MOCK_RECOMMENDED;

  return (
    <View ref={containerRef} className="flex-1 bg-background relative">
      {/* TopAppBar */}
      <View 
        ref={headerRef} 
        className="w-full z-50 flex-row items-center justify-between px-md h-16 border-b"
        style={{
          position: Platform.OS === 'web' ? 'fixed' : 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderBottomColor: 'rgba(124, 116, 122, 0)',
          boxShadow: 'none',
          transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s'
        } as any}
      >
        <View className="flex-row items-center space-x-md">
          <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
            <Image source={{ uri: MOCK_AVATAR }} className="w-full h-full" />
          </View>
          <Typography variant="headline-lg-mobile" className="font-bold text-primary">
            Giải đấu
          </Typography>
        </View>
        <TouchableOpacity 
          className="w-10 h-10 items-center justify-center rounded-full bg-surface-variant"
          onPress={() => Alert.alert('Thông báo', 'Không có thông báo mới')}
        >
          <Bell color="#0F172A" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadTournaments(true)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 64, paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Search & Filter Section */}
        <View className="px-md mt-lg flex-row space-x-sm">
          <View className="flex-1 bg-surface-container-lowest rounded-xl flex-row items-center px-md border border-outline-variant/30 h-12" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
            <Search color="#76777D" size={20} />
            <TextInput 
              placeholder="Tìm kiếm giải đấu..." 
              placeholderTextColor="#76777D"
              className="flex-1 ml-sm font-medium text-primary h-full"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="w-12 h-12 bg-primary rounded-xl items-center justify-center" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
            <Filter color="#ffffff" size={20} />
          </TouchableOpacity>
        </View>

        {/* Featured Section: Active Tournaments */}
        <View className="mt-3xl">
          <View className="flex-row items-center justify-between px-md mb-md">
            <Typography variant="headline-md" className="text-primary font-bold">Giải đấu đang diễn ra</Typography>
            <TouchableOpacity onPress={() => Alert.alert('Điều hướng', 'Xem tất cả giải đấu')}>
              <Typography variant="label-md" className="text-secondary font-bold">Xem tất cả</Typography>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-md pr-sm pb-sm">
            {filteredActiveTournaments.map((tournament: any) => (
              <TouchableOpacity 
                key={tournament.id}
                className="w-[280px] mr-sm bg-surface-container-lowest rounded-[16px] overflow-hidden border border-outline-variant/30"
                style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                onPress={() => router.push(`/tournament/${tournament.id}`)}
              >
                <ImageBackground source={{ uri: tournament.image }} className="h-32 w-full">
                  <View className="absolute top-sm right-sm bg-orange-highlight px-sm py-[2px] rounded-full flex-row items-center space-x-xs">
                    <View className="w-2 h-2 bg-white rounded-full" />
                    <Typography variant="label-sm" className="text-white uppercase">Trực tiếp</Typography>
                  </View>
                  <View className="absolute top-sm left-sm bg-primary/90 px-sm py-[2px] rounded-full">
                    <Typography variant="label-sm" className="text-white">{tournament.sport}</Typography>
                  </View>
                </ImageBackground>
                <View className="p-md">
                  <Typography variant="headline-md" className="text-primary font-bold mb-xs" numberOfLines={1}>
                    {tournament.title}
                  </Typography>
                  <View className="flex-row items-center space-x-sm">
                    <MapPin color="#76777D" size={16} />
                    <Typography variant="label-md" className="text-on-surface-variant">
                      {tournament.location}
                    </Typography>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List Section: Registered & Recommended */}
        <View className="px-md mt-3xl">
          <Typography variant="headline-md" className="text-primary font-bold mb-md">Đã đăng ký & Đề xuất</Typography>
          <View className="space-y-md">
            {filteredRecommendedTournaments.map((item: any, index: number) => {
              const isRegistered = item.status === 'Đã tham gia' || joinedTournaments[item.id];
              const isWaitlist = item.status === 'Danh sách chờ';
              
              const iconBgColors = ['bg-primary/20', 'bg-surface-variant', 'bg-green-success/20', 'bg-primary/10'];
              const iconColors = ['#1d4ed8', '#45464d', '#22C55E', '#1d4ed8'];
              const bgColor = iconBgColors[index % iconBgColors.length];
              const color = iconColors[index % iconColors.length];

              return (
                <TouchableOpacity 
                  key={item.id}
                  className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant/30 flex-row items-center space-x-md"
                  style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                  onPress={() => router.push(`/tournament/${item.id}`)}
                >
                  <View className={`w-16 h-16 rounded-lg ${bgColor} items-center justify-center`}>
                    {renderIcon(item.sport, color)}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Typography variant="label-md" className="font-bold text-primary flex-1 pr-sm" numberOfLines={1}>
                        {item.title}
                      </Typography>
                      {isRegistered ? (
                        <View className="bg-primary/10 px-sm py-[2px] rounded-full">
                          <Typography variant="label-sm" className="text-primary font-bold">Đã tham gia</Typography>
                        </View>
                      ) : isWaitlist ? (
                        <View className="bg-surface-variant px-sm py-[2px] rounded-full">
                          <Typography variant="label-sm" className="text-on-surface-variant font-bold">Danh sách chờ</Typography>
                        </View>
                      ) : (
                        <View className="border border-primary px-sm py-[2px] rounded-full">
                          <Typography variant="label-sm" className="text-primary font-bold">Tham gia</Typography>
                        </View>
                      )}
                    </View>
                    <Typography variant="body-md" className="text-on-surface-variant">
                      {item.date} • {item.info}
                    </Typography>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;

