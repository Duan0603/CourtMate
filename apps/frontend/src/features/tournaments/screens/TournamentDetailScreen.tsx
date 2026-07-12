import React, { useEffect, useState } from 'react';
import { ScrollView, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { tournamentsApi } from '../services/tournaments.api';
import { Tournament, TournamentStatus, SportType } from '@courtmate/shared';
import { Typography } from '../../../components/ui/Typography';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, MapPin, CalendarDays, Download } from 'lucide-react-native';

const statusLabels: Record<TournamentStatus, string> = {
  [TournamentStatus.UPCOMING]: 'Sắp mở',
  [TournamentStatus.OPEN]: 'Đang nhận đăng ký',
  [TournamentStatus.FULL]: 'Đã đủ suất',
  [TournamentStatus.IN_PROGRESS]: 'Đang thi đấu',
  [TournamentStatus.COMPLETED]: 'Đã kết thúc',
};

const sportLabels: Record<SportType, string> = {
  [SportType.BADMINTON]: 'Cầu lông',
  [SportType.FOOTBALL]: 'Bóng đá',
  [SportType.PICKLEBALL]: 'Pickleball',
  [SportType.TENNIS]: 'Tennis',
};

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
      <View className="flex-1 justify-center items-center bg-surface">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const startDateStr = new Date(tournament.startDate).toLocaleDateString('vi-VN');
  const endDateStr = new Date(tournament.endDate).toLocaleDateString('vi-VN');
  const minFee = tournament.categories.length > 0 
    ? Math.min(...tournament.categories.map(c => c.fee))
    : tournament.registrationFee ?? 0;
  
  const isOpen = tournament.status === TournamentStatus.OPEN;

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {tournament.coverImage ? (
          <Image source={{ uri: tournament.coverImage }} className="w-full h-56" resizeMode="cover" />
        ) : (
          <View className="w-full h-56 bg-gray-border" />
        )}
        
        <View className="p-lg space-y-md">
          <View className="flex-row justify-between items-center mb-xs">
            <Badge label={sportLabels[tournament.sport] ?? tournament.sport} variant="primary" />
            <Badge label={statusLabels[tournament.status] ?? tournament.status} variant={isOpen ? 'success' : 'default'} />
          </View>
          
          <Typography variant="headline-lg-mobile" color="navy" className="leading-tight mb-md">
            {tournament.title}
          </Typography>
          
          <View className="flex-row items-center space-x-sm mb-lg bg-surface-card border border-gray-border rounded-lg p-sm">
            <View className="w-12 h-12 rounded-full bg-gray-border" />
            <View className="flex-1 ml-sm">
              <Typography variant="label-sm" color="navy" className="opacity-70 uppercase tracking-widest mb-1">
                Tổ chức bởi
              </Typography>
              <View className="flex-row items-center">
                <Typography variant="headline-md" color="navy" className="mr-1">
                  {tournament.organizer?.name}
                </Typography>
                {tournament.organizer?.isVerified && <ShieldCheck color="#2563EB" size={16} />}
              </View>
            </View>
          </View>

          {/* Navigation Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="border-b border-gray-border pb-2 mb-md">
            <View className="flex-row space-x-md pr-lg">
              {(['info', 'rules', 'schedule', 'participants'] as const).map((tab) => {
                const labels = {
                  info: 'Thông tin',
                  rules: 'Điều lệ',
                  schedule: 'Lịch trình',
                  participants: 'Danh sách',
                };
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity 
                    key={tab} 
                    onPress={() => setActiveTab(tab)}
                    className={`pb-xs ${isActive ? 'border-b-2 border-blue-vibrant' : ''}`}
                  >
                    <Typography 
                      variant="label-md" 
                      color={isActive ? 'blue' : 'navy'}
                      className={isActive ? '' : 'opacity-70'}
                    >
                      {labels[tab]}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Tab Content */}
          <View className="pb-2xl">
            {activeTab === 'info' && (
              <View className="space-y-lg">
                <View>
                  <Typography variant="headline-md" color="navy" className="mb-sm">Giới thiệu</Typography>
                  <Typography variant="body-md" color="navy" className="opacity-80">
                    {tournament.description}
                  </Typography>
                </View>
                
                <View>
                  <Typography variant="headline-md" color="navy" className="mb-sm">Thời gian & Địa điểm</Typography>
                  <View className="flex-row items-center space-x-2 mb-xs">
                    <CalendarDays color="#76777D" size={18} />
                    <Typography variant="body-md" color="navy" className="opacity-80 ml-2">
                      {startDateStr} - {endDateStr}
                    </Typography>
                  </View>
                  <View className="flex-row items-center space-x-2">
                    <MapPin color="#76777D" size={18} />
                    <Typography variant="body-md" color="navy" className="opacity-80 ml-2 flex-1">
                      {tournament.location}, {tournament.district}, {tournament.city}
                    </Typography>
                  </View>
                </View>

                <View>
                  <Typography variant="headline-md" color="navy" className="mb-sm">Hạng mục thi đấu</Typography>
                  <View className="space-y-sm">
                    {tournament.categories.map((c, i) => (
                      <View key={i} className="flex-row justify-between bg-surface-card border border-gray-border p-md rounded-md">
                        <Typography variant="label-md" color="navy">{c.name}</Typography>
                        <Typography variant="label-md" color="navy">{c.fee.toLocaleString('vi-VN')} VND</Typography>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'rules' && (
              <View className="space-y-md">
                <Typography variant="headline-md" color="navy">Điều lệ chi tiết</Typography>
                <Typography variant="body-md" color="navy" className="opacity-80 mb-md">
                  {tournament.rules}
                </Typography>
                <TouchableOpacity className="flex-row items-center justify-center bg-gray-border/30 rounded-lg p-md border border-gray-border">
                  <Download color="#0F172A" size={18} />
                  <Typography variant="label-md" color="navy" className="ml-2">Tải file đính kèm (PDF)</Typography>
                </TouchableOpacity>
              </View>
            )}

            {activeTab === 'schedule' && (
              <View className="space-y-md">
                <Typography variant="headline-md" color="navy">Lịch trình dự kiến</Typography>
                {tournament.schedule?.length ? (
                  <View className="space-y-sm">
                    {tournament.schedule.map((s, i) => (
                      <View key={i} className="flex-row items-start">
                        <View className="w-2 h-2 rounded-full bg-blue-vibrant mt-2 mr-3" />
                        <Typography variant="body-md" color="navy" className="flex-1 opacity-80">{s}</Typography>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Typography variant="body-md" color="navy" className="opacity-70">
                    Chưa có thông tin lịch trình.
                  </Typography>
                )}
              </View>
            )}

            {activeTab === 'participants' && (
              <View className="space-y-md">
                <Typography variant="headline-md" color="navy">Danh sách Vận động viên</Typography>
                <View className="bg-surface-card border border-gray-border rounded-lg p-xl items-center justify-center">
                  <Typography variant="body-md" color="navy" className="opacity-70 text-center">
                    Danh sách sẽ được cập nhật sau khi kết thúc đăng ký.
                  </Typography>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface-card border-t border-gray-border px-lg py-md flex-row justify-between items-center shadow-overlay">
        <View>
          <Typography variant="label-sm" color="navy" className="opacity-70 uppercase tracking-widest mb-1">
            Lệ phí từ
          </Typography>
          <Typography variant="headline-md" color="navy">
            {minFee.toLocaleString('vi-VN')} VND
          </Typography>
        </View>
        <TouchableOpacity 
          className={`px-xl py-sm rounded-lg flex-row items-center justify-center ${isOpen ? 'bg-blue-vibrant' : 'bg-gray-border'}`}
          onPress={() => alert('Đăng ký sẽ mở ở Giai đoạn 4!')}
          disabled={!isOpen}
        >
          <Typography variant="label-md" color={isOpen ? 'white' : 'navy'}>
            {isOpen ? 'Đăng ký ngay' : 'Đã đóng'}
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );
};

