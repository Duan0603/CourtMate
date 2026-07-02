import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, Text, H2, H3, H4, Button, Spinner, View, Image } from 'tamagui';
import { tournamentsApi } from '../services/tournaments.api';
import { Tournament } from '@courtmate/shared';

export const TournamentDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'rules' | 'schedule' | 'participants'>('info');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const data = await tournamentsApi.getTournamentDetails(id);
        setTournament(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading || !tournament) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue10" />
      </YStack>
    );
  }

  const startDateStr = new Date(tournament.startDate).toLocaleDateString('vi-VN');
  const endDateStr = new Date(tournament.endDate).toLocaleDateString('vi-VN');
  const minFee = tournament.categories.length > 0 
    ? Math.min(...tournament.categories.map(c => c.fee))
    : 0;

  return (
    <YStack flex={1} backgroundColor="$background">
      <ScrollView>
        {tournament.coverImage ? (
          <Image source={{ uri: tournament.coverImage }} width="100%" height={200} resizeMode="cover" />
        ) : (
          <View width="100%" height={200} backgroundColor="$gray5" />
        )}
        
        <YStack padding="$4" space="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <View backgroundColor="$blue3" paddingHorizontal="$2" paddingVertical="$1" borderRadius="$2">
              <Text color="$blue10" fontWeight="bold">{tournament.sport}</Text>
            </View>
            <Text color="$green10" fontWeight="bold">{tournament.status}</Text>
          </XStack>
          
          <H2>{tournament.title}</H2>
          
          <XStack space="$2" alignItems="center">
            <View width={32} height={32} borderRadius={16} backgroundColor="$gray4" />
            <Text fontWeight="bold">Tổ chức bởi: {tournament.organizer.name}</Text>
            {tournament.organizer.isVerified && <Text>✅</Text>}
          </XStack>

          {/* Navigation Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space="$2" marginTop="$4" borderBottomWidth={1} borderBottomColor="$gray4" paddingBottom="$2">
              <Button size="$3" theme={activeTab === 'info' ? 'active' : 'alt1'} onPress={() => setActiveTab('info')} chromeless>Thông tin</Button>
              <Button size="$3" theme={activeTab === 'rules' ? 'active' : 'alt1'} onPress={() => setActiveTab('rules')} chromeless>Điều lệ</Button>
              <Button size="$3" theme={activeTab === 'schedule' ? 'active' : 'alt1'} onPress={() => setActiveTab('schedule')} chromeless>Lịch trình</Button>
              <Button size="$3" theme={activeTab === 'participants' ? 'active' : 'alt1'} onPress={() => setActiveTab('participants')} chromeless>Danh sách</Button>
            </XStack>
          </ScrollView>

          {/* Tab Content */}
          <YStack marginTop="$4" paddingBottom="$8">
            {activeTab === 'info' && (
              <YStack space="$4">
                <H4>Giới thiệu</H4>
                <Text>{tournament.description}</Text>
                
                <H4>Thời gian & Địa điểm</H4>
                <Text>Từ: {startDateStr} - Đến: {endDateStr}</Text>
                <Text>Địa điểm: {tournament.location}, {tournament.district}, {tournament.city}</Text>

                <H4>Hạng mục thi đấu</H4>
                {tournament.categories.map((c, i) => (
                  <XStack key={i} justifyContent="space-between" backgroundColor="$gray2" padding="$3" borderRadius="$2">
                    <Text fontWeight="bold">{c.name}</Text>
                    <Text>{c.fee.toLocaleString('vi-VN')} VND</Text>
                  </XStack>
                ))}
              </YStack>
            )}

            {activeTab === 'rules' && (
              <YStack space="$4">
                <H4>Điều lệ chi tiết</H4>
                <Text>{tournament.rules}</Text>
                <Button theme="alt2" marginTop="$2" onPress={() => alert('PDF viewer coming soon')}>Xem file đính kèm (PDF)</Button>
              </YStack>
            )}

            {activeTab === 'schedule' && (
              <YStack space="$4">
                <H4>Lịch trình dự kiến</H4>
                {tournament.schedule?.length ? (
                  tournament.schedule.map((s, i) => (
                    <Text key={i}>• {s}</Text>
                  ))
                ) : (
                  <Text>Chưa có thông tin lịch trình.</Text>
                )}
              </YStack>
            )}

            {activeTab === 'participants' && (
              <YStack space="$4">
                <H4>Danh sách Vận động viên</H4>
                <Text color="$gray10">Danh sách sẽ được cập nhật sau khi kết thúc đăng ký.</Text>
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <XStack padding="$4" paddingBottom="$6" backgroundColor="white" borderTopWidth={1} borderTopColor="$gray4" justifyContent="space-between" alignItems="center" position="absolute" bottom={0} left={0} right={0}>
        <YStack>
          <Text color="$gray10" fontSize="$2">Lệ phí từ</Text>
          <Text fontWeight="bold" fontSize="$5" color="$red10">{minFee.toLocaleString('vi-VN')} VND</Text>
        </YStack>
        <Button 
          theme="active" 
          size="$4" 
          onPress={() => alert('Đăng ký sẽ mở ở Giai đoạn 4!')}
          disabled={tournament.status !== 'OPEN'}
          opacity={tournament.status === 'OPEN' ? 1 : 0.5}
        >
          {tournament.status === 'OPEN' ? 'Đăng ký ngay' : 'Đã đóng / Full'}
        </Button>
      </XStack>
    </YStack>
  );
};
