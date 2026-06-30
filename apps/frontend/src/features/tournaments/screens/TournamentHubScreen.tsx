import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, Text, H2, H4, Button, Spinner, View, Input, Sheet, Label, Select, Adapt } from 'tamagui';
import { Search, Filter, ChevronDown, Check } from 'lucide-react-native';
import { tournamentsApi } from '../services/tournaments.api';
import { TournamentCard } from '../components/TournamentCard';
import { Tournament, SportType, TournamentFilterDto, TournamentStatus } from '@courtmate/shared';

// Ideally, fetch current city from user preferences context
const MOCK_USER_CITY = 'Da Nang';

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
  
  // Sheet State
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<TournamentFilterDto>({
    city: MOCK_USER_CITY,
  });

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
    setFilters(tempFilters);
    setSheetOpen(false);
  };
  
  const resetFilters = () => {
    const reset = { city: MOCK_USER_CITY };
    setTempFilters(reset);
    setFilters(reset);
    setKeyword('');
    setSheetOpen(false);
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <YStack padding="$4" paddingBottom="$0" space="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <H2>Giải đấu</H2>
          <Button size="$3" theme="alt2" onPress={() => setSheetOpen(true)} icon={<Filter size={16} />}>
            Bộ lọc
          </Button>
        </XStack>

        <XStack space="$2" alignItems="center">
          <Input 
            flex={1} 
            placeholder="Tìm kiếm giải đấu, nhà tổ chức..." 
            value={keyword}
            onChangeText={setKeyword}
            left={<Search size={18} color="gray" style={{ marginLeft: 10 }} />}
            paddingLeft="$8"
          />
        </XStack>
        
        {/* Quick Sport Filters (Optional if we want to keep them outside sheet) */}
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
                {sport}
              </Button>
            ))}
          </XStack>
        </ScrollView>
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
                <Text>Không tìm thấy giải đấu nào phù hợp.</Text>
                <Button onPress={resetFilters}>Xóa bộ lọc</Button>
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
        snapPoints={[60]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" space="$4" backgroundColor="$background">
          <H2>Bộ lọc nâng cao</H2>
          
          <YStack space="$2">
            <Label fontWeight="bold">Khu vực</Label>
            <XStack space="$2" flexWrap="wrap">
              {['Da Nang', 'Ha Noi', 'Ho Chi Minh'].map(city => (
                <Button 
                  key={city}
                  size="$3"
                  theme={tempFilters.city === city ? 'active' : 'alt1'}
                  onPress={() => setTempFilters(prev => ({ ...prev, city }))}
                  marginBottom="$2"
                >
                  {city}
                </Button>
              ))}
            </XStack>
          </YStack>

          <YStack space="$2">
            <Label fontWeight="bold">Trạng thái</Label>
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
            </XStack>
          </YStack>

          <View flex={1} />
          
          <XStack space="$3" paddingBottom="$4">
            <Button flex={1} theme="alt1" onPress={() => setTempFilters(filters)}>
              Hủy
            </Button>
            <Button flex={2} theme="active" onPress={applyFilters}>
              Áp dụng
            </Button>
          </XStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
};
