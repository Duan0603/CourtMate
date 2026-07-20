import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Award, CalendarDays, Check, ChevronDown, Filter, MapPin, Search, SlidersHorizontal, Trophy, Users } from 'lucide-react-native';
import { router } from 'expo-router';
import { Tournament } from '@courtmate/shared';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { useLogin } from '../../auth/hooks/useLogin';
import { FACEBOOK_TOURNAMENTS } from '../../tournaments/data/facebook-tournaments';

const NAVY = '#00102F';
const BLUE = '#0077FF';
const YELLOW = '#FFC400';
const CANVAS = '#F7FAFF';
const MUTED = '#52627A';
const BORDER = 'rgba(0,16,47,0.12)';

export const MOCK_ACTIVE_TOURNAMENTS = [
  {
    id: 'court-1',
    title: 'CourtMate Pickleball Open Đà Nẵng',
    sport: 'Pickleball',
    location: 'Khu thể thao Tuyên Sơn, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85',
    description: 'Giải đấu cộng đồng dành cho các cặp vận động viên tại Đà Nẵng.',
    status: 'IN_PROGRESS',
    level: 'Bán chuyên',
    fee: 150000,
    joinedSlots: 24,
    totalSlots: 32,
  },
  {
    id: 'court-2',
    title: 'Cúp Cầu lông Phong trào Hải Châu',
    sport: 'Cầu lông',
    location: 'Nhà thi đấu Phan Châu Trinh, Đà Nẵng',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85',
    description: 'Sân chơi phong trào dành cho vận động viên cầu lông khu vực Hải Châu.',
    status: 'OPEN',
    level: 'Phong trào',
    fee: 100000,
    joinedSlots: 12,
    totalSlots: 24,
  },
];

export const MOCK_RECOMMENDED = FACEBOOK_TOURNAMENTS;

const SPORTS = ['Tất cả', 'Pickleball', 'Cầu lông', 'Tennis', 'Bóng đá'];
const PLAYERS = [
  { id: 'p1', name: 'Nguyễn Văn Hùng', sport: 'Tennis', level: 'Bán chuyên', location: 'Hải Châu, Đà Nẵng' },
  { id: 'p2', name: 'Trần Thị Mai', sport: 'Cầu lông', level: 'Trung bình', location: 'Sơn Trà, Đà Nẵng' },
  { id: 'p3', name: 'Phạm Minh Đức', sport: 'Pickleball', level: 'Phong trào', location: 'Thanh Khê, Đà Nẵng' },
];

function sportName(value: string) {
  const labels: Record<string, string> = { PICKLEBALL: 'Pickleball', BADMINTON: 'Cầu lông', TENNIS: 'Tennis', FOOTBALL: 'Bóng đá' };
  return labels[value] || value;
}

function formatFee(value?: number) {
  if (!value) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}đ`;
}

function TournamentCard({ item, featured = false }: { item: any; featured?: boolean }) {
  const id = item.id || item._id;
  const image = item.image || item.coverImage;
  const status = item.status === 'IN_PROGRESS' ? 'Đang diễn ra' : item.status === 'COMPLETED' ? 'Đã kết thúc' : 'Đang mở đăng ký';
  const organizerName = item.organizer?.name || item.organizer || item.sourceName || 'CourtMate Community';
  const fee = item.fee ?? item.registrationFee ?? item.categories?.[0]?.fee;
  const totalSlots = item.totalSlots ?? item.slotsLimit ?? item.categories?.[0]?.maxParticipants;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push(`/tournament/${id}`)}
      style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden', marginBottom: 16 }}
    >
      {image ? (
        <View style={{ height: featured ? 184 : 156 }}>
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{sportName(item.sport)}</Text>
          </View>
          <View style={{ position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, height: 28, borderRadius: 14, backgroundColor: YELLOW, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: NAVY, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>{status}</Text>
          </View>
        </View>
      ) : null}
      <View style={{ padding: 16 }}>
        <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600' }} numberOfLines={2}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Award color={YELLOW} size={18} />
          <Text style={{ color: NAVY, fontSize: 14, lineHeight: 20, fontWeight: '600', marginLeft: 6, flex: 1 }} numberOfLines={1}>{organizerName}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <MapPin color={MUTED} size={18} />
          <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20, marginLeft: 6, flex: 1 }} numberOfLines={2}>{item.location || item.info || 'Đà Nẵng'}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>Lệ phí</Text>
            <Text style={{ color: NAVY, fontSize: 16, lineHeight: 24, fontWeight: '600' }}>{formatFee(fee)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>Quy mô</Text>
            <Text style={{ color: NAVY, fontSize: 16, lineHeight: 24, fontWeight: '600' }}>{totalSlots ? `${totalSlots} suất` : item.prizePool || 'Đang cập nhật'}</Text>
          </View>
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' }}>
            <Trophy color="#FFFFFF" size={22} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const DashboardScreen: React.FC = () => {
  const { user } = useLogin();
  const [apiTournaments, setApiTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('Tất cả');
  const [mode, setMode] = useState<'TOURNAMENTS' | 'PLAYERS'>('TOURNAMENTS');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    setError(false);
    try {
      const result = await tournamentsApi.getTournaments({ city: user?.preferences?.location || 'Da Nang' });
      setApiTournaments(result.data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.preferences?.location]);

  useEffect(() => { load(); }, [load]);

  const tournaments = useMemo(() => {
    const source: any[] = apiTournaments.length ? apiTournaments : [...MOCK_ACTIVE_TOURNAMENTS, ...FACEBOOK_TOURNAMENTS];
    return source.filter(item => {
      const text = `${item.title} ${item.sport} ${item.location || item.info || ''}`.toLowerCase();
      const matchesQuery = text.includes(query.trim().toLowerCase());
      const matchesSport = selectedSport === 'Tất cả' || sportName(item.sport).toLowerCase().includes(selectedSport.toLowerCase());
      return matchesQuery && matchesSport;
    });
  }, [apiTournaments, query, selectedSport]);

  const filteredPlayers = PLAYERS.filter(player => selectedSport === 'Tất cả' || player.sport === selectedSport).filter(player => `${player.name} ${player.sport}`.toLowerCase().includes(query.toLowerCase()));
  const firstName = user?.name?.split(' ')[0] || 'bạn';
  const city = user?.preferences?.location === 'Ha Noi' ? 'Hà Nội' : user?.preferences?.location === 'Ho Chi Minh' ? 'TP. Hồ Chí Minh' : 'Đà Nẵng';

  return (
    <View style={{ flex: 1, backgroundColor: CANVAS }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={BLUE} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text style={{ color: NAVY, fontSize: 28, lineHeight: 34, fontWeight: '600' }}>Xin chào, {firstName}</Text>
            <TouchableOpacity onPress={() => Alert.alert('Khu vực', 'Thay đổi khu vực trong hồ sơ cá nhân.')} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center' }}>
              <MapPin color={BLUE} size={18} />
              <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20, marginLeft: 6 }}>{city}</Text>
              <ChevronDown color={MUTED} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <View style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: BORDER, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
            <Search color={MUTED} size={20} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Tìm giải đấu hoặc nhà tổ chức" placeholderTextColor="#7B8AA3" style={{ flex: 1, color: NAVY, fontSize: 16, marginLeft: 10 }} />
          </View>
          <TouchableOpacity accessibilityLabel="Mở bộ lọc" onPress={() => setFiltersOpen(value => !value)} style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: filtersOpen ? YELLOW : NAVY, marginLeft: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Filter color={filtersOpen ? NAVY : '#FFFFFF'} size={20} />
          </TouchableOpacity>
        </View>

        {filtersOpen && (
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}><SlidersHorizontal color={BLUE} size={20} /><Text style={{ color: NAVY, fontSize: 20, fontWeight: '600', marginLeft: 8 }}>Bộ lọc nhanh</Text></View>
            <Text style={{ color: MUTED, fontSize: 14, lineHeight: 20, marginTop: 8 }}>Chọn môn thể thao bên dưới. Bộ lọc nâng cao sẽ được bổ sung trong sheet riêng.</Text>
            <TouchableOpacity onPress={() => { setSelectedSport('Tất cả'); setQuery(''); setFiltersOpen(false); }} style={{ height: 44, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 8 }}>
              <Text style={{ color: BLUE, fontSize: 14, fontWeight: '600' }}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {SPORTS.map(sport => {
            const selected = selectedSport === sport;
            return (
              <TouchableOpacity key={sport} onPress={() => setSelectedSport(sport)} style={{ minHeight: 44, paddingHorizontal: 16, marginRight: 8, borderRadius: 22, flexDirection: 'row', alignItems: 'center', backgroundColor: selected ? BLUE : '#FFFFFF', borderWidth: 1, borderColor: selected ? BLUE : BORDER }}>
                {selected && <Check color="#FFFFFF" size={16} />}
                <Text style={{ color: selected ? '#FFFFFF' : NAVY, fontSize: 14, fontWeight: '600', marginLeft: selected ? 6 : 0 }}>{sport}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={{ height: 48, padding: 4, borderRadius: 16, backgroundColor: '#E2EBF7', flexDirection: 'row', marginBottom: 24 }}>
          {[{ id: 'TOURNAMENTS', label: 'Giải đấu', icon: Trophy }, { id: 'PLAYERS', label: 'Người chơi', icon: Users }].map(item => {
            const selected = mode === item.id;
            const Icon = item.icon;
            return (
              <TouchableOpacity key={item.id} onPress={() => setMode(item.id as any)} style={{ flex: 1, borderRadius: 12, backgroundColor: selected ? NAVY : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Icon color={selected ? '#FFFFFF' : MUTED} size={18} />
                <Text style={{ color: selected ? '#FFFFFF' : MUTED, fontSize: 14, fontWeight: '600', marginLeft: 8 }}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {mode === 'TOURNAMENTS' ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600' }}>{query || selectedSport !== 'Tất cả' ? `${tournaments.length} kết quả` : 'Giải đấu nổi bật'}</Text>
              <CalendarDays color={BLUE} size={22} />
            </View>
            {loading ? <ActivityIndicator color={BLUE} size="large" style={{ marginTop: 48 }} /> : error && !tournaments.length ? (
              <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ color: NAVY, fontSize: 20, fontWeight: '600', textAlign: 'center' }}>Không thể tải giải đấu</Text>
                <Text style={{ color: MUTED, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 8 }}>Kiểm tra kết nối rồi thử lại.</Text>
                <TouchableOpacity onPress={() => load()} style={{ height: 48, paddingHorizontal: 20, borderRadius: 12, backgroundColor: BLUE, justifyContent: 'center', marginTop: 16 }}><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Tải lại giải đấu</Text></TouchableOpacity>
              </View>
            ) : tournaments.length ? tournaments.map((item, index) => <TournamentCard key={item.id || item._id} item={item} featured={index === 0} />) : (
              <View style={{ padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ color: NAVY, fontSize: 20, fontWeight: '600' }}>Chưa tìm thấy giải đấu</Text>
                <Text style={{ color: MUTED, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 8 }}>Thử đổi từ khóa, khu vực hoặc bộ lọc để xem thêm kết quả.</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{ color: NAVY, fontSize: 20, lineHeight: 24, fontWeight: '600', marginBottom: 12 }}>Người chơi gần bạn</Text>
            {filteredPlayers.map(player => (
              <TouchableOpacity key={player.id} onPress={() => router.push({ pathname: '/(tabs)/chat', params: { player: player.name } })} style={{ minHeight: 88, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: NAVY, alignItems: 'center', justifyContent: 'center' }}><Users color={YELLOW} size={22} /></View>
                <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: NAVY, fontSize: 16, lineHeight: 24, fontWeight: '600' }}>{player.name}</Text><Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>{player.sport} · {player.level}</Text><Text style={{ color: MUTED, fontSize: 14, lineHeight: 20 }}>{player.location}</Text></View>
                <View style={{ height: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: BLUE, justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Liên hệ</Text></View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreen;
