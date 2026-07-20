import React, { useCallback, useEffect, useState, useRef, useMemo, useContext } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, RefreshControl, ImageBackground, TextInput, Platform, LayoutAnimation, UIManager, Modal } from 'react-native';
import { Trophy, Award, BarChart2, MapPin, Target, CircleDashed, Tent, Activity, Search, Filter, Calendar, ChevronDown, ChevronUp, Sparkles, SlidersHorizontal, Check, Users, MessageSquare, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Tournament, TournamentFilterDto } from '@courtmate/shared';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { useLogin } from '../../auth/hooks/useLogin';
import { Typography } from '../../../components/ui/Typography';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderScrollContext } from '../../../../app/(tabs)/_layout';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

if (Platform.OS === 'web') {
  gsap.registerPlugin(ScrollTrigger);
}


export const MOCK_ACTIVE_TOURNAMENTS = [
  {
    id: 'mock-1',
    title: 'Elite Clay Masters 2026',
    sport: 'Quần vợt',
    location: 'Metropolis Arena',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=800&q=80',
    isLive: true,
  },
  {
    id: 'mock-2',
    title: 'Pro City Hoop Series',
    sport: 'Bóng rổ',
    location: 'Skyline Sports Complex',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
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

export const MOCK_PLAYERS = [
  {
    id: 'p-1',
    name: 'Nguyễn Văn Hùng',
    username: '@hung_tennis',
    sport: 'Quần vợt',
    level: 'Bán chuyên',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    location: 'Sân Quận Hải Châu, Đà Nẵng',
    matchCount: '32 trận',
    rating: '4.8'
  },
  {
    id: 'p-2',
    name: 'Trần Thị Mai',
    username: '@mai_badminton',
    sport: 'Cầu lông',
    level: 'Trung bình',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    location: 'CLB Tuyên Sơn, Đà Nẵng',
    matchCount: '18 trận',
    rating: '4.9'
  },
  {
    id: 'p-3',
    name: 'Phạm Minh Đức',
    username: '@duc_basketball',
    sport: 'Bóng rổ',
    level: 'Mới chơi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    location: 'Sân Trung tâm Thể thao, Đà Nẵng',
    matchCount: '8 trận',
    rating: '4.5'
  },
  {
    id: 'p-4',
    name: 'Lê Hoàng Nam',
    username: '@nam_football',
    sport: 'Bóng đá',
    level: 'Chuyên nghiệp',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    location: 'Sân bóng Trực thuộc QK5, Đà Nẵng',
    matchCount: '54 trận',
    rating: '5.0'
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
  const insets = useSafeAreaInsets();
  const { isScrolled, setIsScrolled } = useContext(HeaderScrollContext);

  const scrollViewRef = useRef<any>(null);

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const scrolled = y > 20;
    if (scrolled !== isScrolled) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsScrolled(scrolled);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const timer = setTimeout(() => {
      const scrollContainer = scrollViewRef.current?.getScrollableNode?.() || window;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer === window ? "body" : scrollContainer,
          scroller: scrollContainer,
          start: "top top",
          end: "+=120",
          scrub: 0.5,
        }
      });

      // 1. Collapse the container physically
      tl.to('.collapsible-content', {
        height: 0,
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          const els = document.querySelectorAll('.search-bar, .action-buttons, .collapsible-content');
          els.forEach((el: any) => {
            el.style.pointerEvents = 'none';
          });
        },
        onReverseComplete: () => {
          const els = document.querySelectorAll('.search-bar, .action-buttons, .collapsible-content');
          els.forEach((el: any) => {
            el.style.pointerEvents = 'auto';
          });
        }
      });

      // Fade out individual items
      tl.to(['.search-bar', '.action-buttons'], {
        y: -15,
        opacity: 0,
        scale: 0.97,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out"
      }, "<");

      // 2. The Header Container (Morphing to Sticky Bar)
      tl.to('.header-container', {
        backgroundColor: "#FFFFFF",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
        paddingBottom: "16px",
        borderBottomWidth: "1px",
        borderBottomColor: "#E0E0E0",
        borderBottomLeftRadius: "24px",
        borderBottomRightRadius: "24px",
        duration: 1,
        ease: "none"
      }, "<");

      // 3. The Pinned Top Row (Avatar & Text)
      tl.to('.header-avatar', {
        scale: 0.85,
        duration: 1,
        ease: "none"
      }, "<");

      tl.to('.header-greeting', {
        scale: 0.92,
        transformOrigin: "left center",
        duration: 1,
        ease: "none"
      }, "<");
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t: any) => t.kill());
    };
  }, []);

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joinedTournaments, setJoinedTournaments] = useState<Record<string, boolean>>({});
  
  const { search, filter } = useLocalSearchParams<{ search?: string; filter?: string }>();
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Custom filters state
  const [currentCity, setCurrentCity] = useState(user?.preferences?.location || 'Da Nang');
  const [isFilterOpen, setIsFilterOpen] = useState(filter === 'true');

  useEffect(() => {
    if (search !== undefined) {
      setSearchQuery(search);
    }
  }, [search]);

  useEffect(() => {
    if (filter !== undefined) {
      setIsFilterOpen(filter === 'true');
    }
  }, [filter]);
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('DATE');
  const [dashboardTab, setDashboardTab] = useState<'TOURNAMENTS' | 'PLAYERS'>('TOURNAMENTS');

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

  // GSAP animation for filter removed as we now use Modal

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

  const filteredPlayers = useMemo(() => {
    let list = MOCK_PLAYERS;
    
    // Filter by location city
    list = list.filter(p => p.location.toLowerCase().includes(currentCity === 'Da Nang' ? 'đà nẵng' : currentCity === 'Ha Noi' ? 'hà nội' : 'hồ chí minh'));

    // Filter by Category Sport
    if (selectedSport !== 'ALL') {
      list = list.filter(p => normalizeSport(p.sport) === selectedSport);
    }

    // Filter by level
    if (selectedLevel !== 'ALL') {
      list = list.filter(p => {
        const lvl = p.level.toLowerCase();
        if (selectedLevel === 'BEGINNER') return lvl.includes('mới');
        if (selectedLevel === 'INTERMEDIATE') return lvl.includes('trung');
        if (selectedLevel === 'ADVANCED') return lvl.includes('chuyên nghiệp') || lvl.includes('bán chuyên');
        return true;
      });
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q) || p.sport.toLowerCase().includes(q));
    }

    return list;
  }, [searchQuery, currentCity, selectedSport, selectedLevel]);



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
        ref={scrollViewRef}
        className="flex-1"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadTournaments(true)} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 192, paddingBottom: 100 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
        </View>

        {/* Filter Modal */}
        <Modal
          visible={isFilterOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setIsFilterOpen(false);
            router.setParams({ filter: 'false' });
          }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={() => {
              setIsFilterOpen(false);
              router.setParams({ filter: 'false' });
            }} 
            className="flex-1 bg-black/40 justify-center items-center px-4"
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()} 
              className="bg-white w-full rounded-2xl p-md overflow-hidden max-w-sm"
              style={{ maxHeight: '80%' }}
            >
              <View className="flex-row justify-between items-center mb-md border-b border-slate-100 pb-3">
                <Typography variant="headline-md" className="font-bold text-slate-900">Bộ lọc</Typography>
                <TouchableOpacity 
                  onPress={() => {
                    setIsFilterOpen(false);
                    router.setParams({ filter: 'false' });
                  }}
                  className="p-1 rounded-full bg-slate-100 active:scale-95"
                >
                  <X color="#64748B" size={20} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
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
              className="w-full bg-surface-container-high py-sm rounded-xl items-center justify-center border border-outline-variant/20 mt-2"
            >
              <Typography variant="label-sm" className="text-on-surface-variant font-bold">Đặt lại tất cả bộ lọc</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => {
                setIsFilterOpen(false);
                router.setParams({ filter: 'false' });
              }}
              className="w-full bg-primary py-sm rounded-xl items-center justify-center mt-3"
            >
              <Typography variant="label-sm" className="text-white font-bold">Áp dụng</Typography>
            </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

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

        {/* Toggle between Tournaments and Players */}
        <View className="flex-row mx-md mt-md bg-surface-container-high rounded-full p-[3px] border border-outline-variant/10">
          <TouchableOpacity 
            onPress={() => setDashboardTab('TOURNAMENTS')}
            className={`flex-1 py-[10px] rounded-full items-center justify-center flex-row space-x-xs ${
              dashboardTab === 'TOURNAMENTS' ? 'bg-primary shadow-sm' : 'bg-transparent'
            }`}
          >
            <Trophy color={dashboardTab === 'TOURNAMENTS' ? '#ffffff' : '#76777D'} size={14} />
            <Typography variant="label-sm" className={`font-bold ml-1 ${dashboardTab === 'TOURNAMENTS' ? 'text-white' : 'text-on-surface-variant'}`}>
              Giải đấu
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setDashboardTab('PLAYERS')}
            className={`flex-1 py-[10px] rounded-full items-center justify-center flex-row space-x-xs ${
              dashboardTab === 'PLAYERS' ? 'bg-primary shadow-sm' : 'bg-transparent'
            }`}
          >
            <Users color={dashboardTab === 'PLAYERS' ? '#ffffff' : '#76777D'} size={14} />
            <Typography variant="label-sm" className={`font-bold ml-1 ${dashboardTab === 'PLAYERS' ? 'text-white' : 'text-on-surface-variant'}`}>
              Người chơi & Đối thủ
            </Typography>
          </TouchableOpacity>
        </View>

        {dashboardTab === 'PLAYERS' ? (
          filteredPlayers.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-md">
              <Typography variant="body-lg" className="text-on-surface-variant font-medium text-slate-500 text-center">
                Không tìm thấy người chơi phù hợp
              </Typography>
            </View>
          ) : (
            <View className="mt-lg px-md">
              <View className="flex-row items-center justify-between mb-md">
                <Typography variant="headline-md" className="text-primary font-bold">Người chơi đề xuất</Typography>
                <Typography variant="label-md" className="text-on-surface-variant font-medium">{filteredPlayers.length} VĐV</Typography>
              </View>
              
              {filteredPlayers.map((player) => (
                <View 
                  key={player.id}
                  className="bg-surface-container-lowest p-md rounded-2xl border border-outline-variant/30 flex-row items-center space-x-md mb-sm"
                  style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}
                >
                  {/* Left: Avatar & Rating */}
                  <View className="relative mr-sm">
                    <ImageBackground 
                      source={{ uri: player.avatar }} 
                      className="w-14 h-14 rounded-full overflow-hidden"
                      imageStyle={{ borderRadius: 28 }}
                    />
                    <View className="absolute -bottom-1 -right-1 bg-orange-highlight px-[6px] py-[2px] rounded-full border border-surface-container-lowest">
                      <Typography variant="label-sm" className="text-white font-black text-[9px]">{player.rating}★</Typography>
                    </View>
                  </View>

                  {/* Middle: Details */}
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-xs mb-[2px] flex-wrap">
                      <Typography variant="headline-md" className="font-bold text-slate-900 text-[14px]" numberOfLines={1}>
                        {player.name}
                      </Typography>
                      <View className="bg-primary/10 px-[6px] py-[2px] rounded">
                        <Typography variant="label-sm" className="text-primary text-[8px] font-bold uppercase">{player.sport}</Typography>
                      </View>
                    </View>
                    
                    <Typography variant="body-md" className="text-on-surface-variant text-[11px] mb-xs opacity-75">
                      {player.username} • Trình độ: {player.level}
                    </Typography>

                    <View className="flex-row items-center space-x-xs mt-[2px]">
                      <MapPin color="#76777D" size={10} />
                      <Typography variant="label-sm" className="text-on-surface-variant text-[10px]" numberOfLines={1}>
                        {player.location}
                      </Typography>
                    </View>
                  </View>

                  {/* Right: Actions */}
                  <View className="flex-col space-y-xs justify-center items-end pl-xs">
                    <TouchableOpacity 
                      onPress={() => Alert.alert('Thành công', `Đã gửi lời mời thách đấu đến ${player.name}!`)}
                      className="bg-primary px-sm py-[6px] rounded-full items-center justify-center"
                    >
                      <Typography variant="label-sm" className="text-white font-bold text-[10px]">Thách đấu</Typography>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => router.push({ pathname: '/(tabs)/chat', params: { chatting: 'true', player: player.name } })}
                      className="bg-surface-container-high border border-outline-variant/30 px-[10px] py-[6px] rounded-full flex-row items-center space-x-xs mt-1"
                    >
                      <MessageSquare color="#1d4ed8" size={10} />
                      <Typography variant="label-sm" className="text-primary font-bold text-[10px] ml-1">Chat</Typography>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          filteredActiveTournaments.length === 0 && filteredRecommendedTournaments.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20 px-md">
              <Typography variant="body-lg" className="text-on-surface-variant font-medium text-slate-500 text-center">
                Không tìm thấy giải đấu
              </Typography>
            </View>
          ) : (
            <>
              {/* Featured Section: Active Tournaments */}
              {filteredActiveTournaments.length > 0 && (
                <View className="mt-lg">
                  <View className="flex-row items-center justify-between px-md mb-md">
                    <Typography variant="headline-md" className="text-primary font-bold">Giải đấu đang diễn ra</Typography>
                    <TouchableOpacity onPress={() => Alert.alert('Điều hướng', 'Xem tất cả giải đấu')}>
                      <Typography variant="label-md" className="text-secondary font-bold">Xem tất cả</Typography>
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-md pr-sm pb-sm">
                    {filteredActiveTournaments.map((tournament: any) => {
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
                    })}
                  </ScrollView>
                </View>
              )}

              {/* List Section: Registered & Recommended */}
              {filteredRecommendedTournaments.length > 0 && (
                <View className="px-md mt-lg">
                  <Typography variant="headline-md" className="text-primary font-bold mb-md">Đã đăng ký & Đề xuất</Typography>
                  <View className="space-y-md">
                    {filteredRecommendedTournaments.map((item: any, index: number) => {
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
                      );
                    })}
                  </View>
                </View>
              )}
            </>
          )
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;


