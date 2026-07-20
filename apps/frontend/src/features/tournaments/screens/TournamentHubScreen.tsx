import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, Text, H2, H4, Button, Spinner, View, Input, Sheet, Label, Select, Adapt } from 'tamagui';
import { Search, Filter, ChevronDown, Check, X } from 'lucide-react-native';
import { tournamentsApi } from '../services/tournaments.api';
import { TournamentCard } from '../components/TournamentCard';
import { Tournament, SportType, TournamentFilterDto, TournamentStatus } from '@courtmate/shared';

// Ideally, fetch current city from user preferences context
const MOCK_USER_CITY = 'Da Nang';

// Fee range presets (VND)
const FEE_RANGES = [
  { label: 'Tất cả', min: undefined, max: undefined },
  { label: 'Dưới 100K', min: 0, max: 100000 },
  { label: '100K - 300K', min: 100000, max: 300000 },
  { label: '300K - 500K', min: 300000, max: 500000 },
  { label: 'Trên 500K', min: 500000, max: undefined },
];

// Sport label mapping
const SPORT_LABELS: Record<string, string> = {
  [SportType.BADMINTON]: '🏸 Cầu lông',
  [SportType.FOOTBALL]: '⚽ Bóng đá',
  [SportType.PICKLEBALL]: '🏓 Pickleball',
  [SportType.TENNIS]: '🎾 Tennis',
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const TournamentHubScreen = ({ navigation }: any) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  
  // Search & Filter State
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);
  
  const [filters, setFilters] = useState<TournamentFilterDto>({
    city: MOCK_USER_CITY,
  });

  // Active fee range index
  const [activeFeeRange, setActiveFeeRange] = useState(0);
  
  // Sheet State
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<TournamentFilterDto>({
    city: MOCK_USER_CITY,
  });
  const [tempFeeRange, setTempFeeRange] = useState(0);

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    filters.sport,
    filters.status,
    filters.minFee !== undefined || filters.maxFee !== undefined ? true : undefined,
  ].filter(Boolean).length;

  const fetchTournaments = useCallback(async (currentFilters: TournamentFilterDto) => {
    try {
      const response = await tournamentsApi.getTournaments(currentFilters);
      setTournaments(response.data);
      setIsFallback(response.meta.isFallback);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Trigger fetch when debouncedKeyword or filters change
  useEffect(() => {
    setLoading(true);
    fetchTournaments({ ...filters, keyword: debouncedKeyword });
  }, [debouncedKeyword, filters, fetchTournaments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments({ ...filters, keyword: debouncedKeyword });
  };

  const applyFilters = () => {
    const feeRange = FEE_RANGES[tempFeeRange];
    setFilters({ ...tempFilters, minFee: feeRange.min, maxFee: feeRange.max });
    setActiveFeeRange(tempFeeRange);
    setSheetOpen(false);
  };
  
  const resetFilters = () => {
    const reset: TournamentFilterDto = { city: MOCK_USER_CITY };
    setTempFilters(reset);
    setTempFeeRange(0);
    setActiveFeeRange(0);
    setFilters(reset);
    setKeyword('');
    setSheetOpen(false);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4" paddingBottom="$0" space="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <H2>Giải đấu</H2>
          <Button 
            size="$3" 
            theme={activeFilterCount > 0 ? 'active' : 'alt2'}
            onPress={() => {
              setTempFilters(filters);
              setTempFeeRange(activeFeeRange);
              setSheetOpen(true);
            }} 
            icon={<Filter size={16} />}
          >
            Bộ lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>
        </XStack>

        <XStack space="$2" alignItems="center" position="relative">
          <View position="absolute" left={12} zIndex={10}>
            <Search size={18} color="gray" />
          </View>
          <Input 
            flex={1} 
            placeholder="Tìm kiếm giải đấu, nhà tổ chức..." 
            value={keyword}
            onChangeText={setKeyword}
            paddingLeft="$8"
          />
          {keyword.length > 0 && (
            <View 
              position="absolute" 
              right={12} 
              zIndex={10} 
              onPress={() => setKeyword('')}
              cursor="pointer"
              pressStyle={{ opacity: 0.6 }}
            >
              <X size={18} color="gray" />
            </View>
          )}
        </XStack>
        
        {/* Quick Sport Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack space="$2" paddingBottom="$2">
            <Button 
              size="$3" 
              theme={!filters.sport ? 'active' : 'alt1'}
              onPress={() => setFilters(prev => ({ ...prev, sport: undefined }))}
            >
              Tất cả
            </Button>
            {Object.values(SportType).map(sport => (
              <Button 
                key={sport} 
                size="$3" 
                theme={filters.sport === sport ? 'active' : 'alt1'}
                onPress={() => setFilters(prev => ({ ...prev, sport: sport as SportType }))}
              >
                {SPORT_LABELS[sport] || sport}
              </Button>
            ))}
          </XStack>
        </ScrollView>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <XStack space="$2" flexWrap="wrap">
            {filters.status && (
              <XStack 
                bg="$blue3" 
                px="$2" 
                py="$1" 
                borderRadius="$2" 
                alignItems="center" 
                space="$1"
                marginBottom="$1"
              >
                <Text fontSize="$2" color="$blue10">
                  {filters.status === TournamentStatus.OPEN ? 'Đang mở' : filters.status}
                </Text>
                <View onPress={() => setFilters(prev => ({ ...prev, status: undefined }))} cursor="pointer">
                  <X size={12} color="#2563EB" />
                </View>
              </XStack>
            )}
            {(filters.minFee !== undefined || filters.maxFee !== undefined) && (
              <XStack 
                bg="$green3" 
                px="$2" 
                py="$1" 
                borderRadius="$2" 
                alignItems="center" 
                space="$1"
                marginBottom="$1"
              >
                <Text fontSize="$2" color="$green10">
                  {FEE_RANGES[activeFeeRange]?.label || 'Lệ phí'}
                </Text>
                <View onPress={() => {
                  setFilters(prev => ({ ...prev, minFee: undefined, maxFee: undefined }));
                  setActiveFeeRange(0);
                }} cursor="pointer">
                  <X size={12} color="#16a34a" />
                </View>
              </XStack>
            )}
            <View onPress={resetFilters} cursor="pointer" py="$1">
              <Text fontSize="$2" color="$red10" fontWeight="600">Xóa tất cả</Text>
            </View>
          </XStack>
        )}
      </YStack>

      {loading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$blue10" />
        </YStack>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <YStack padding="$4" paddingTop="$2" space="$4">
            {/* Result count */}
            <Text fontSize="$3" color="$gray10">
              {tournaments.length} giải đấu được tìm thấy
            </Text>

            {/* Empty State / Fallback Notice */}
            {isFallback && (
              <YStack backgroundColor="$orange3" padding="$3" borderRadius="$3" space="$2">
                <H4 color="$orange10">Chưa có giải đấu tại {filters.city}</H4>
                <Text color="$orange10">Dưới đây là các giải đấu nổi bật ở khu vực khác.</Text>
              </YStack>
            )}

            {isFallback && <H4 marginTop="$4">🌍 Các tỉnh thành khác</H4>}

            {tournaments.length === 0 ? (
              <YStack padding="$4" alignItems="center" space="$3">
                <Text fontSize="$6">🔍</Text>
                <Text fontWeight="bold" fontSize="$5">Không tìm thấy giải đấu</Text>
                <Text color="$gray10" textAlign="center">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác.
                </Text>
                <Button onPress={resetFilters} theme="active" mt="$2">Xóa bộ lọc</Button>
              </YStack>
            ) : (
              <YStack space="$4">
                {tournaments.map(tournament => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={tournament} 
                    onPress={() => navigation.navigate('TournamentDetail', { id: tournament.id })}
                  />
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      )}

      <Sheet
        modal
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        snapPoints={[70]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" space="$4" backgroundColor="$background">
          <XStack justifyContent="space-between" alignItems="center">
            <H2>Bộ lọc nâng cao</H2>
            <View onPress={() => setSheetOpen(false)} cursor="pointer" p="$2">
              <X size={20} color="#666" />
            </View>
          </XStack>
          
          {/* City filter */}
          <YStack space="$2">
            <Label fontWeight="bold">📍 Khu vực</Label>
            <XStack space="$2" flexWrap="wrap">
              {['Da Nang', 'Ha Noi', 'Ho Chi Minh'].map(city => {
                const labels: Record<string, string> = { 'Da Nang': 'Đà Nẵng', 'Ha Noi': 'Hà Nội', 'Ho Chi Minh': 'TP. HCM' };
                return (
                  <Button 
                    key={city}
                    size="$3"
                    theme={tempFilters.city === city ? 'active' : 'alt1'}
                    onPress={() => setTempFilters(prev => ({ ...prev, city }))}
                    marginBottom="$2"
                  >
                    {labels[city] || city}
                  </Button>
                );
              })}
            </XStack>
          </YStack>

          {/* Status filter */}
          <YStack space="$2">
            <Label fontWeight="bold">📋 Trạng thái</Label>
            <XStack space="$2" flexWrap="wrap">
              <Button 
                size="$3"
                theme={!tempFilters.status ? 'active' : 'alt1'}
                onPress={() => setTempFilters(prev => ({ ...prev, status: undefined }))}
                marginBottom="$2"
              >
                Tất cả
              </Button>
              <Button 
                size="$3"
                theme={tempFilters.status === TournamentStatus.OPEN ? 'active' : 'alt1'}
                onPress={() => setTempFilters(prev => ({ ...prev, status: TournamentStatus.OPEN }))}
                marginBottom="$2"
              >
                Đang mở đăng ký
              </Button>
              <Button 
                size="$3"
                theme={tempFilters.status === TournamentStatus.UPCOMING ? 'active' : 'alt1'}
                onPress={() => setTempFilters(prev => ({ ...prev, status: TournamentStatus.UPCOMING }))}
                marginBottom="$2"
              >
                Sắp diễn ra
              </Button>
            </XStack>
          </YStack>

          {/* Fee range filter */}
          <YStack space="$2">
            <Label fontWeight="bold">💰 Mức lệ phí</Label>
            <XStack space="$2" flexWrap="wrap">
              {FEE_RANGES.map((range, idx) => (
                <Button 
                  key={idx}
                  size="$3"
                  theme={tempFeeRange === idx ? 'active' : 'alt1'}
                  onPress={() => setTempFeeRange(idx)}
                  marginBottom="$2"
                >
                  {range.label}
                </Button>
              ))}
            </XStack>
          </YStack>

          <View flex={1} />
          
          <XStack space="$3" paddingBottom="$4">
            <Button flex={1} theme="alt1" onPress={resetFilters}>
              Đặt lại
            </Button>
            <Button flex={2} theme="active" onPress={applyFilters}>
              Áp dụng bộ lọc
            </Button>
          </XStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
};
