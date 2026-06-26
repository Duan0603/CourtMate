import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, XStack, Text, H2, H4, Button, Spinner, View } from 'tamagui';
import { tournamentsApi } from '../services/tournaments.api';
import { TournamentCard } from '../components/TournamentCard';
import { Tournament, SportType } from '@courtmate/shared';

// Ideally, fetch current city from user preferences context
const MOCK_USER_CITY = 'Da Nang';

export const TournamentHubScreen = ({ navigation }: any) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportType | 'ALL'>('ALL');
  const [isFallback, setIsFallback] = useState(false);

  const fetchTournaments = async () => {
    try {
      const response = await tournamentsApi.getTournaments(MOCK_USER_CITY);
      setTournaments(response.data);
      setIsFallback(response.meta.isFallback);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTournaments();
  };

  const filteredTournaments = selectedSport === 'ALL' 
    ? tournaments 
    : tournaments.filter(t => t.sport === selectedSport);

  if (loading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <YStack padding="$4" space="$4">
          <XStack justifyContent="space-between" alignItems="center">
            <H2>Giải đấu</H2>
            <Button size="$3" theme="alt2" onPress={() => alert('Change city feature coming soon')}>
              📍 {MOCK_USER_CITY}
            </Button>
          </XStack>

          {/* Sport Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space="$2" paddingBottom="$2">
              <Button 
                size="$3" 
                theme={selectedSport === 'ALL' ? 'active' : 'alt1'}
                onPress={() => setSelectedSport('ALL')}
              >
                Tất cả
              </Button>
              {Object.values(SportType).map(sport => (
                <Button 
                  key={sport} 
                  size="$3" 
                  theme={selectedSport === sport ? 'active' : 'alt1'}
                  onPress={() => setSelectedSport(sport as SportType)}
                >
                  {sport}
                </Button>
              ))}
            </XStack>
          </ScrollView>

          {/* Empty State / Fallback Notice */}
          {isFallback && (
            <YStack backgroundColor="$orange3" padding="$3" borderRadius="$3" space="$2">
              <H4 color="$orange10">Chưa có giải đấu tại {MOCK_USER_CITY}</H4>
              <Text color="$orange10">Dưới đây là các giải đấu nổi bật ở khu vực khác.</Text>
              <XStack space="$2" marginTop="$2">
                <Button flex={1} size="$3" theme="orange" onPress={() => alert('Coming in Phase 3!')}>
                  Tạo giải đấu
                </Button>
                <Button flex={1} size="$3" theme="alt2" onPress={() => alert('We will notify you!')}>
                  Nhận thông báo
                </Button>
              </XStack>
            </YStack>
          )}

          {isFallback && <H4 marginTop="$4">🌍 Các tỉnh thành khác</H4>}

          {filteredTournaments.length === 0 ? (
            <YStack padding="$4" alignItems="center">
              <Text>Không tìm thấy giải đấu nào.</Text>
            </YStack>
          ) : (
            <YStack space="$4">
              {filteredTournaments.map(tournament => (
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
    </YStack>
  );
};
