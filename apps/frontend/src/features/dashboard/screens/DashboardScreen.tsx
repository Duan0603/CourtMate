import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl, ImageBackground, TextInput, Platform } from 'react-native';
import { Trophy, Award, BarChart2, MapPin, Target, CircleDashed, Tent, Activity, Search, Filter, Calendar, ChevronDown, ChevronUp, Sparkles, SlidersHorizontal, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import gsap from 'gsap';
import { Tournament, TournamentFilterDto } from '@courtmate/shared';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { useLogin } from '../../auth/hooks/useLogin';
import { Typography } from '../../../components/ui/Typography';
import { LinearGradient } from 'expo-linear-gradient';


export const MOCK_ACTIVE_TOURNAMENTS = [
  {
    id: 'mock-1',
    title: 'Elite Clay Masters 2026',
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

function formatDate(value: Date | string | undefined | null) {
  if (!value) return 'Sắp diễn ra';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Sắp diễn ra';
  return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
}

const normalizeSport = (sport: string) => {
  const s = sport?.toLowerCase() || '';
  if (s.includes('badminton') || s.includes('cầu lông')) return 'BADMINTON';
  if (s.includes('tennis') || s.includes('quần vợt')) return 'TENNIS';
  if (s.includes('football') || s.includes('bóng đá') || s.includes('futsal')) return 'FOOTBALL';
  if (s.includes('pickleball')) return 'PICKLEBALL';
  if (s.includes('basketball') || s.includes('bóng rổ')) return 'BASKETBALL';
  if (s.includes('volleyball') || s.includes('bóng chuyền')) return 'VOLLEYBALL';
  return 'OTHER';
};

const CATEGORIES = [
  { id: 'ALL', name: 'Tất cả', icon: SlidersHorizontal },
  { id: 'BADMINTON', name: 'Cầu lông', icon: Activity },
  { id: 'TENNIS', name: 'Tennis', icon: Target },
  { id: 'FOOTBALL', name: 'Bóng đá', icon: Trophy },
  { id: 'BASKETBALL', name: 'Bóng rổ', icon: CircleDashed },
  { id: 'PICKLEBALL', name: 'Pickleball', icon: Award },
];

export const DashboardScreen: React.FC = () => {
  const { user } = useLogin();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joinedTournaments, setJoinedTournaments] = useState<Record<string, boolean>>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Custom filters state
  const [currentCity, setCurrentCity] = useState(user?.preferences?.location || 'Da Nang');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('DATE');

  const isFocused = useIsFocused();
  const containerRef = useRef<View>(null);
  const filterPanelRef = useRef<View>(null);

  useEffect(() => {
    if (isFocused && Platform.OS === 'web' && containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 15 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [isFocused]);

  useEffect(() => {
    if (Platform.OS === 'web' && filterPanelRef.current) {
      if (isFilterOpen) {
        gsap.set(filterPanelRef.current, { display: 'flex' });
        gsap.fromTo(filterPanelRef.current,
          { height: 0, opacity: 0, scaleY: 0.95, transformOrigin: 'top center' },
          { height: 'auto', opacity: 1, scaleY: 1, duration: 0.35, ease: 'power2.out' }
        );
      } else {
        gsap.to(filterPanelRef.current, {
          height: 0,
          opacity: 0,
          scaleY: 0.95,
          transformOrigin: 'top center',
          duration: 0.25,
          ease: 'power2.in',
          onComplete: () => {
            gsap.set(filterPanelRef.current, { display: 'none' });
          }
        });
      }
    }
  }, [isFilterOpen]);

  const loadTournaments = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    try {
      const response = await tournamentsApi.getTournaments({ city: currentCity } as TournamentFilterDto);
      setTournaments(response.data ?? []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [currentCity]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const handleCitySelect = () => {
    Alert.alert(
      'Chọn khu vực',
      'Vui lòng chọn thành phố bạn muốn xem giải đấu:',
      [
        { text: 'Đà Nẵng', onPress: () => setCurrentCity('Da Nang') },
        { text: 'Hà Nội', onPress: () => setCurrentCity('Ha Noi') },
        { text: 'TP. Hồ Chí Minh', onPress: () => setCurrentCity('Ho Chi Minh') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  // Filtered and sorted Active tournaments (Live Carousel)
  const filteredActiveTournaments = useMemo(() => {
    let list = MOCK_ACTIVE_TOURNAMENTS.map(t => ({
      ...t,
      prizePool: t.id === 'mock-1' ? '12,000,000đ' : '8,000,000đ',
      joinedSlots: t.id === 'mock-1' ? 24 : 12,
      totalSlots: t.id === 'mock-1' ? 32 : 16,
      level: t.id === 'mock-1' ? 'Chuyên nghiệp' : 'Bán chuyên',
      status: 'IN_PROGRESS',
      fee: t.id === 'mock-1' ? 150000 : 100000,
      startDate: new Date()
    }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.sport.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
      );
    }

    if (selectedSport !== 'ALL') {
      list = list.filter(t => normalizeSport(t.sport) === selectedSport);
    }

    if (selectedLevel !== 'ALL') {
      list = list.filter(t => {
        const lvl = t.level.toLowerCase();
        if (selectedLevel === 'BEGINNER') return lvl.includes('mới') || lvl.includes('nghiệp dư') || lvl.includes('tự do');
        if (selectedLevel === 'INTERMEDIATE') return lvl.includes('trung') || lvl.includes('bán chuyên');
        if (selectedLevel === 'ADVANCED') return lvl.includes('chuyên nghiệp') || lvl.includes('cao');
        return true;
      });
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter(t => t.status === selectedStatus);
    }

    list = [...list].sort((a, b) => {
      if (selectedSort === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      if (selectedSort === 'PRIZE') {
        const parsePrize = (str: string) => parseInt(str.replace(/[^0-9]/g, '')) || 0;
        return parsePrize(b.prizePool) - parsePrize(a.prizePool);
      }
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return list;
  }, [searchQuery, selectedSport, selectedLevel, selectedStatus, selectedSort]);

  // Filtered and sorted Recommended & Registered list
  const filteredRecommendedTournaments = useMemo(() => {
    let rawList = tournaments.length > 0 ? tournaments.map((t, idx) => ({
      id: t.id || (t as any)._id,
      title: t.title,
      sport: t.sport,
      date: formatDate(t.startDate),
      startDate: t.startDate,
      location: t.location || currentCity,
      info: t.location || currentCity,
      status: t.status || 'OPEN',
      prizePool: t.registrationFee ? `${(t.registrationFee * 10).toLocaleString('vi-VN')}đ` : '5,000,000đ',
      joinedSlots: Math.min(Math.floor(Math.random() * 12) + 5, t.slotsLimit || 16),
      totalSlots: t.slotsLimit || 16,
      level: idx % 2 === 0 ? 'Bán chuyên' : 'Chuyên nghiệp',
      fee: t.registrationFee || 0,
      isReal: true
    })) : MOCK_RECOMMENDED.map(t => ({
      ...t,
      startDate: t.id === 'rec-1' ? new Date(Date.now() + 7 * 86400000) : 
                 t.id === 'rec-2' ? new Date(Date.now() + 10 * 86400000) :
                 t.id === 'rec-3' ? new Date(Date.now() - 3 * 86400000) : new Date(Date.now() + 20 * 86400000),
      prizePool: t.id === 'rec-1' ? '15,000,000đ' :
                 t.id === 'rec-2' ? '5,000,000đ' :
                 t.id === 'rec-3' ? '3,000,000đ' : '50,000,000đ',
      joinedSlots: t.id === 'rec-1' ? 40 :
                   t.id === 'rec-2' ? 10 :
                   t.id === 'rec-3' ? 32 : 64,
      totalSlots: t.id === 'rec-1' ? 48 :
                  t.id === 'rec-2' ? 16 :
                  t.id === 'rec-3' ? 32 : 72,
      level: t.id === 'rec-1' ? 'Chuyên nghiệp' :
             t.id === 'rec-2' ? 'Nghiệp dư' :
             t.id === 'rec-3' ? 'Tự do' : 'Chuyên nghiệp',
      fee: t.id === 'rec-1' ? 150000 :
           t.id === 'rec-2' ? 200000 :
           t.id === 'rec-3' ? 50000 : 1000000,
      isReal: false
    }));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rawList = rawList.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.sport.toLowerCase().includes(q) ||
        t.info.toLowerCase().includes(q)
      );
    }

    if (selectedSport !== 'ALL') {
      rawList = rawList.filter(t => normalizeSport(t.sport) === selectedSport);
    }

    if (selectedLevel !== 'ALL') {
      rawList = rawList.filter(t => {
        const lvl = t.level.toLowerCase();
        if (selectedLevel === 'BEGINNER') return lvl.includes('mới') || lvl.includes('nghiệp dư') || lvl.includes('tự do');
        if (selectedLevel === 'INTERMEDIATE') return lvl.includes('trung') || lvl.includes('bán chuyên');
        if (selectedLevel === 'ADVANCED') return lvl.includes('chuyên nghiệp') || lvl.includes('cao');
        return true;
      });
    }

    if (selectedStatus !== 'ALL') {
      rawList = rawList.filter(t => {
        const stat = t.status?.toUpperCase();
        if (selectedStatus === 'OPEN') return stat === 'OPEN' || stat === 'ĐĂNG KÝ';
        if (selectedStatus === 'UPCOMING') return stat === 'UPCOMING' || stat === 'SẮP DIỄN RA';
        if (selectedStatus === 'IN_PROGRESS') return stat === 'IN_PROGRESS' || stat === 'ĐANG DIỄN RA' || stat === 'ĐANG ĐẤU';
        if (selectedStatus === 'COMPLETED') return stat === 'COMPLETED' || stat === 'ĐÃ KẾT THÚC' || stat === 'KẾT THÚC';
        return true;
      });
    }

    rawList = [...rawList].sort((a, b) => {
      if (selectedSort === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      if (selectedSort === 'PRIZE') {
        const parsePrize = (str: string) => parseInt(str.replace(/[^0-9]/g, '')) || 0;
        return parsePrize(b.prizePool) - parsePrize(a.prizePool);
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return rawList;
  }, [searchQuery, tournaments, currentCity, selectedSport, selectedLevel, selectedStatus, selectedSort]);



  const handleJoin = (id: string) => {
    setJoinedTournaments(prev => ({ ...prev, [id]: true }));
    Alert.alert('Thành công', 'Bạn đã đăng ký giải đấu này!');
  };

  const renderIcon = (sport: string, color: string) => {
    const s = sport?.toLowerCase() || '';
    if (s.includes('tennis') || s.includes('quần vợt') || s.includes('padel')) {
      return <Target color={color} size={26} />;
    }
    if (s.includes('football') || s.includes('bóng đá') || s.includes('futsal')) {
      return <Trophy color={color} size={26} />;
    }
    if (s.includes('basketball') || s.includes('bóng rổ')) {
      return <Activity color={color} size={26} />;
    }
    if (s.includes('volleyball') || s.includes('bóng chuyền')) {
      return <Sparkles color={color} size={26} />;
    }
    if (s.includes('badminton') || s.includes('cầu lông') || s.includes('pickleball')) {
      return <Award color={color} size={26} />;
    }
    return <Award color={color} size={26} />;
  };

  return (
    <View ref={containerRef} className="flex-1 bg-background relative">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadTournaments(true)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      >
        {/* Welcome / Quick Actions section inside dashboard content */}
        <View className="px-md mt-md flex-row justify-between items-center">
          <View className="flex-col">
            <Typography variant="headline-sm" className="font-bold text-slate-900">
              Tournaments
            </Typography>
            <TouchableOpacity onPress={handleCitySelect} className="flex-row items-center space-x-xs mt-xs">
              <MapPin color="#76777D" size={12} />
              <Typography variant="label-sm" className="text-on-surface-variant font-bold text-[12px]">
                {currentCity === 'Da Nang' ? 'Đà Nẵng' : currentCity === 'Ha Noi' ? 'Hà Nội' : 'TP. Hồ Chí Minh'}
              </Typography>
              <ChevronDown color="#76777D" size={10} />
            </TouchableOpacity>
          </View>
          
          <View className="flex-row items-center space-x-sm">
            <TouchableOpacity 
              className="flex-row items-center space-x-xs px-[12px] py-[8px] rounded-full bg-blue-50 border border-blue-100"
              onPress={() => Alert.alert(
                'Hệ Thống Xếp Hạng CourtMate',
                '🏆 Bảng Rank: Nơi vinh danh các tay vợt xuất sắc nhất tại khu vực của bạn.\n\n⭐ Điểm Rank (XP): Bạn sẽ nhận được Điểm Rank khi tham gia các giải đấu, giao lưu hoặc giành chiến thắng. Tích lũy Điểm Rank để thăng hạng từ Đồng -> Bạc -> Vàng -> Bạch Kim -> Kim Cương -> Cao Thủ!\n\nHãy tích cực tham gia các giải đấu để leo rank nhé!',
                [{ text: 'Đã hiểu', style: 'default' }]
              )}
            >
              <Trophy color="#2563eb" size={14} />
              <Typography variant="label-sm" className="text-blue-600 font-bold text-[12px]">Bảng rank</Typography>
            </TouchableOpacity>
          </View>
        </View>
        {/* Search & Filter Section (Glowing Input) */}
        <View className="px-md mt-lg flex-row space-x-sm items-center">
          <LinearGradient
            colors={isSearchFocused ? ['#1d4ed8', '#8b5cf6', '#ec4899'] : ['rgba(124, 116, 122, 0.2)', 'rgba(124, 116, 122, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ padding: 1.5, borderRadius: 12, flex: 1 }}
          >
            <View className="bg-surface-container-lowest rounded-[11px] flex-row items-center px-md h-11">
              <Search color={isSearchFocused ? "#1d4ed8" : "#76777D"} size={18} />
              <TextInput 
                placeholder="Tìm kiếm giải đấu..." 
                placeholderTextColor="#76777D"
                className="flex-1 ml-sm font-medium text-primary h-full text-[14px]"
                style={Platform.OS === 'web' ? { outline: 'none', borderStyle: 'none' } as any : undefined}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
            </View>
          </LinearGradient>

          <TouchableOpacity 
            onPress={() => setIsFilterOpen(!isFilterOpen)}
            className={`w-12 h-12 rounded-xl items-center justify-center ${isFilterOpen ? 'bg-primary' : 'bg-surface-container-lowest border border-outline-variant/30'}`}
            style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
          >
            <Filter color={isFilterOpen ? '#ffffff' : '#1d4ed8'} size={20} />
          </TouchableOpacity>
        </View>

        {/* Collapsible Dropdown Filter panel */}
        <View 
          ref={filterPanelRef}
          className="mx-md mt-sm p-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-level-2"
          style={Platform.OS === 'web' ? { overflow: 'hidden', height: 0, opacity: 0, display: 'none' } : { display: isFilterOpen ? 'flex' : 'none' }}
        >
            {/* Filter by Level */}
            <View className="mb-md">
              <Typography variant="label-sm" className="text-on-surface-variant font-bold mb-sm">Trình độ</Typography>
              <View className="flex-row flex-wrap gap-xs">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'BEGINNER', label: 'Mới chơi / Phong trào' },
                  { id: 'INTERMEDIATE', label: 'Trung bình / Bán chuyên' },
                  { id: 'ADVANCED', label: 'Chuyên nghiệp / Pro' }
                ].map((lvl) => (
                  <TouchableOpacity
                    key={lvl.id}
                    onPress={() => setSelectedLevel(lvl.id)}
                    className={`px-sm py-xs rounded-lg border ${
                      selectedLevel === lvl.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-surface-container-low border-outline-variant/20'
                    }`}
                  >
                    <Typography variant="label-sm" className={selectedLevel === lvl.id ? 'text-primary font-bold' : 'text-on-surface-variant'}>
                      {lvl.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Filter by Status */}
            <View className="mb-md">
              <Typography variant="label-sm" className="text-on-surface-variant font-bold mb-sm">Trạng thái giải đấu</Typography>
              <View className="flex-row flex-wrap gap-xs">
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'OPEN', label: 'Đang mở đăng ký' },
                  { id: 'UPCOMING', label: 'Sắp diễn ra' },
                  { id: 'IN_PROGRESS', label: 'Đang diễn ra' },
                  { id: 'COMPLETED', label: 'Đã kết thúc' }
                ].map((stat) => (
                  <TouchableOpacity
                    key={stat.id}
                    onPress={() => setSelectedStatus(stat.id)}
                    className={`px-sm py-xs rounded-lg border ${
                      selectedStatus === stat.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-surface-container-low border-outline-variant/20'
                    }`}
                  >
                    <Typography variant="label-sm" className={selectedStatus === stat.id ? 'text-primary font-bold' : 'text-on-surface-variant'}>
                      {stat.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sorting options */}
            <View className="mb-md">
              <Typography variant="label-sm" className="text-on-surface-variant font-bold mb-sm">Sắp xếp theo</Typography>
              <View className="flex-row flex-wrap gap-xs">
                {[
                  { id: 'DATE', label: 'Ngày bắt đầu (Gần nhất)' },
                  { id: 'PRIZE', label: 'Cơ cấu giải thưởng (Cao nhất)' },
                  { id: 'TITLE', label: 'Tên giải đấu (A-Z)' }
                ].map((sortOption) => (
                  <TouchableOpacity
                    key={sortOption.id}
                    onPress={() => setSelectedSort(sortOption.id)}
                    className={`px-sm py-xs rounded-lg border ${
                      selectedSort === sortOption.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'bg-surface-container-low border-outline-variant/20'
                    }`}
                  >
                    <Typography variant="label-sm" className={selectedSort === sortOption.id ? 'text-primary font-bold' : 'text-on-surface-variant'}>
                      {sortOption.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reset filters */}
            <TouchableOpacity 
              onPress={() => {
                setSelectedSport('ALL');
                setSelectedLevel('ALL');
                setSelectedStatus('ALL');
                setSelectedSort('DATE');
                setSearchQuery('');
              }}
              className="w-full bg-surface-container-high py-sm rounded-xl items-center justify-center border border-outline-variant/20"
            >
              <Typography variant="label-sm" className="text-on-surface-variant font-bold">Đặt lại tất cả bộ lọc</Typography>
            </TouchableOpacity>
        </View>

        {/* Scrollable Sport Category Quick Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="pl-md mt-md pr-sm pb-sm"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedSport === cat.id;
            const IconComponent = cat.icon;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedSport(cat.id)}
                className={`flex-row items-center space-x-xs px-md py-[10px] mr-sm rounded-full border ${
                  isSelected 
                    ? 'bg-primary border-primary' 
                    : 'bg-surface-container-lowest border-outline-variant/20'
                }`}
                style={isSelected ? { elevation: 3, shadowColor: '#1d4ed8', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } } : {}}
              >
                <IconComponent color={isSelected ? '#ffffff' : '#76777D'} size={15} />
                <Typography variant="label-sm" className={`font-bold ${isSelected ? 'text-white' : 'text-on-surface-variant'}`}>
                  {cat.name}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Statistics Dashboard Overview Row */}
        <View className="px-md mt-md flex-row justify-between space-x-sm">
          <LinearGradient
            colors={['rgba(29, 78, 216, 0.08)', 'rgba(29, 78, 216, 0.02)']}
            style={{ flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(29, 78, 216, 0.15)' }}
          >
            <View className="flex-row justify-between items-center mb-xs">
              <Typography variant="label-sm" className="text-primary font-bold text-[11px]">Giải đấu</Typography>
              <Trophy color="#1d4ed8" size={14} />
            </View>
            <Typography variant="headline-md" className="text-primary font-bold text-[18px]">
              {tournaments.length > 0 ? `${tournaments.length} Mở` : '3 Đang mở'}
            </Typography>
            <Typography variant="label-xs" style={{ fontSize: 9 }} className="text-on-surface-variant mt-[2px]">
              Khu vực {currentCity === 'Da Nang' ? 'Đà Nẵng' : currentCity === 'Ha Noi' ? 'Hà Nội' : 'Hồ Chí Minh'}
            </Typography>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(34, 197, 94, 0.08)', 'rgba(34, 197, 94, 0.02)']}
            style={{ flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.15)' }}
          >
            <View className="flex-row justify-between items-center mb-xs">
              <Typography variant="label-sm" className="text-green-success font-bold text-[11px]">Đã tham gia</Typography>
              <Check color="#22C55E" size={14} />
            </View>
            <Typography variant="headline-md" className="text-green-success font-bold text-[18px]">
              {Object.keys(joinedTournaments).filter(k => joinedTournaments[k]).length + 1} Giải
            </Typography>
            <Typography variant="label-xs" style={{ fontSize: 9 }} className="text-on-surface-variant mt-[2px]">
              Đang tham gia so tài
            </Typography>
          </LinearGradient>

          <TouchableOpacity
            onPress={() => Alert.alert(
              'Điểm Rank & Cấp Bậc Của Bạn',
              '👤 Cấp bậc hiện tại: Bạch Kim IV\n🔥 Điểm tích lũy: 680 XP\n\nBạn cần thêm 120 XP nữa để thăng hạng lên Bạch Kim III. Tham gia giải đấu tiếp theo để nhận tối thiểu +50 XP nhé!',
              [{ text: 'Đã hiểu', style: 'default' }]
            )}
            style={{ flex: 1 }}
          >
            <LinearGradient
              colors={['rgba(249, 115, 22, 0.08)', 'rgba(249, 115, 22, 0.02)']}
              style={{ padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.15)', height: '100%' }}
            >
              <View className="flex-row justify-between items-center mb-xs">
                <Typography variant="label-sm" className="text-orange-highlight font-bold text-[11px]">Điểm Rank</Typography>
                <Award color="#F97316" size={14} />
              </View>
              <Typography variant="headline-md" className="text-orange-highlight font-bold text-[18px]">
                680 XP
              </Typography>
              <Typography variant="label-xs" style={{ fontSize: 9 }} className="text-on-surface-variant mt-[2px]">
                Hạng: Bạch Kim IV
              </Typography>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Featured Section: Active Tournaments */}
        <View className="mt-lg">
          <View className="flex-row items-center justify-between px-md mb-md">
            <Typography variant="headline-md" className="text-primary font-bold">Giải đấu đang diễn ra</Typography>
            <TouchableOpacity onPress={() => Alert.alert('Điều hướng', 'Xem tất cả giải đấu')}>
              <Typography variant="label-md" className="text-secondary font-bold">Xem tất cả</Typography>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-md pr-sm pb-sm">
            {filteredActiveTournaments.length === 0 ? (
              <View className="w-[280px] h-36 bg-surface-container-lowest rounded-[16px] justify-center items-center border border-outline-variant/30 mr-md">
                <Typography variant="body-md" className="text-on-surface-variant font-medium">Không tìm thấy giải đấu</Typography>
              </View>
            ) : (
              filteredActiveTournaments.map((tournament: any) => {
                const progressPercent = Math.round((tournament.joinedSlots / tournament.totalSlots) * 100);
                return (
                  <TouchableOpacity 
                    key={tournament.id}
                    className="w-[290px] mr-sm bg-surface-container-lowest rounded-[16px] overflow-hidden border border-outline-variant/30"
                    style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                    onPress={() => router.push(`/tournament/${tournament.id}`)}
                  >
                    <ImageBackground source={{ uri: tournament.image }} className="h-36 w-full">
                      <View className="absolute top-sm right-sm bg-orange-highlight px-sm py-[2px] rounded-full flex-row items-center space-x-xs">
                        <View className="w-2 h-2 bg-white rounded-full" />
                        <Typography variant="label-sm" className="text-white uppercase font-bold" style={{ fontSize: 9 }}>Trực tiếp</Typography>
                      </View>
                      <View className="absolute top-sm left-sm bg-primary/95 px-sm py-[2px] rounded-full">
                        <Typography variant="label-sm" className="text-white font-bold" style={{ fontSize: 9 }}>{tournament.sport}</Typography>
                      </View>
                    </ImageBackground>
                    
                    <View className="p-md">
                      <View className="bg-primary/10 px-[6px] py-[2px] rounded self-start mb-xs">
                        <Typography variant="label-sm" className="text-primary text-[10px] font-bold uppercase">{tournament.level}</Typography>
                      </View>

                      <Typography variant="headline-md" className="text-primary font-bold mb-xs" numberOfLines={1} style={{ fontSize: 16 }}>
                        {tournament.title}
                      </Typography>
                      
                      <View className="flex-row items-center space-x-xs mb-sm">
                        <MapPin color="#76777D" size={13} />
                        <Typography variant="label-md" className="text-on-surface-variant text-[12px]" numberOfLines={1}>
                          {tournament.location}
                        </Typography>
                      </View>

                      {/* Extra card metadata */}
                      <View className="pt-xs border-t border-outline-variant/10 flex-row justify-between items-center mt-sm">
                        <View className="flex-row items-center space-x-xs">
                          <Award color="#F97316" size={13} />
                          <Typography variant="label-sm" className="text-orange-highlight font-bold text-[11px]">{tournament.prizePool}</Typography>
                        </View>
                        <View className="flex-row items-center space-x-xs">
                          <Trophy color="#1d4ed8" size={13} />
                          <Typography variant="label-sm" className="text-primary font-bold text-[11px]">{tournament.joinedSlots}/{tournament.totalSlots} Đội</Typography>
                        </View>
                      </View>
                      <View className="w-full h-1.5 bg-outline-variant/10 rounded-full overflow-hidden mt-xs">
                        <View className="h-full bg-primary rounded-full" style={{ width: `${progressPercent}%` }} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* List Section: Registered & Recommended */}
        <View className="px-md mt-lg">
          <Typography variant="headline-md" className="text-primary font-bold mb-md">Đã đăng ký & Đề xuất</Typography>
          <View className="space-y-md">
            {filteredRecommendedTournaments.length === 0 ? (
              <View className="bg-surface-container-lowest rounded-xl p-xl border border-outline-variant/30 items-center justify-center">
                <Typography variant="body-md" className="text-on-surface-variant font-medium">Không tìm thấy giải đấu phù hợp</Typography>
              </View>
            ) : (
              filteredRecommendedTournaments.map((item: any, index: number) => {
                const isRegistered = item.status === 'Đã tham gia' || joinedTournaments[item.id];
                const isWaitlist = item.status === 'Danh sách chờ' || item.status === 'FULL';
                const progressPercent = Math.round((item.joinedSlots / item.totalSlots) * 100);
                
                const iconBgColors = ['bg-primary/20', 'bg-surface-variant', 'bg-green-success/20', 'bg-primary/10'];
                const iconColors = ['#1d4ed8', '#45464d', '#22C55E', '#1d4ed8'];
                const bgColor = iconBgColors[index % iconBgColors.length];
                const color = iconColors[index % iconColors.length];

                return (
                  <TouchableOpacity 
                    key={item.id}
                    className="bg-surface-container-lowest rounded-2xl p-md border border-outline-variant/30 flex-row items-center space-x-md animate-fade-in"
                    style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                    onPress={() => router.push(`/tournament/${item.id}`)}
                  >
                    <View className={`w-16 h-16 rounded-xl ${bgColor} items-center justify-center`}>
                      {renderIcon(item.sport, color)}
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row justify-between items-start mb-xs">
                        <View className="flex-1 pr-sm">
                          <Typography variant="label-md" className="font-bold text-primary" numberOfLines={1} style={{ fontSize: 15 }}>
                            {item.title}
                          </Typography>
                          {/* Level and Sport Tags */}
                          <View className="flex-row space-x-xs mt-[2px] items-center">
                            <View className="bg-surface-container-high px-1.5 py-[2px] rounded">
                              <Typography variant="label-xs" className="text-on-surface-variant font-bold text-[8px] uppercase">{item.sport}</Typography>
                            </View>
                            <View className="bg-primary/5 px-1.5 py-[2px] rounded">
                              <Typography variant="label-xs" className="text-primary font-bold text-[8px] uppercase">{item.level}</Typography>
                            </View>
                          </View>
                        </View>
                        
                        {isRegistered ? (
                          <View className="bg-primary/10 px-sm py-[4px] rounded-full">
                            <Typography variant="label-sm" className="text-primary font-bold" style={{ fontSize: 10 }}>Đã tham gia</Typography>
                          </View>
                        ) : isWaitlist ? (
                          <View className="bg-surface-variant px-sm py-[4px] rounded-full">
                            <Typography variant="label-sm" className="text-on-surface-variant font-bold" style={{ fontSize: 10 }}>Đầy Slot</Typography>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            onPress={(e) => {
                              e.stopPropagation();
                              handleJoin(item.id);
                            }}
                            className="bg-primary px-sm py-[4px] rounded-full"
                          >
                            <Typography variant="label-sm" className="text-white font-bold" style={{ fontSize: 10 }}>Tham gia</Typography>
                          </TouchableOpacity>
                        )}
                      </View>
                      
                      <Typography variant="body-md" className="text-on-surface-variant mb-xs" style={{ fontSize: 12 }}>
                        {item.date} • {item.info}
                      </Typography>

                      {/* Bottom slots progress bar & Prize pool info */}
                      <View className="flex-row justify-between items-center mt-xs pt-xs border-t border-outline-variant/5">
                        <View className="flex-row items-center space-x-xs flex-1 mr-md">
                          <Trophy color="#1d4ed8" size={12} />
                          <Typography variant="label-sm" className="text-primary font-bold text-[10px]">{item.joinedSlots}/{item.totalSlots} Slots</Typography>
                          <View className="w-16 h-1.5 bg-outline-variant/10 rounded-full overflow-hidden ml-xs">
                            <View className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
                          </View>
                        </View>
                        <View className="flex-row items-center space-x-xs">
                          <Award color="#F97316" size={12} />
                          <Typography variant="label-sm" className="text-orange-highlight font-bold text-[10px]">{item.prizePool}</Typography>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )
              })
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;


