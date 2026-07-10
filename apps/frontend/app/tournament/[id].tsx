import React, { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { Button, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  ChevronLeft,
  Clock,
  FileText,
  MapPin,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react-native';
import { SportType, Tournament, TournamentStatus, UserRole } from '@courtmate/shared';
import { tournamentsApi } from '../../src/features/tournaments/services/tournaments.api';
import { useLogin } from '../../src/features/auth/hooks/useLogin';

const colors = {
  background: '#14100E',
  backgroundSecondary: '#1E1815',
  surface: 'rgba(255,255,255,0.05)',
  surfaceHover: 'rgba(255,255,255,0.08)',
  surfaceBorder: 'rgba(255,255,255,0.10)',
  primary: '#FF6B35',
  primaryMuted: 'rgba(255,107,53,0.15)',
  secondary: '#1FA598',
  secondaryMuted: 'rgba(31,165,152,0.15)',
  warning: '#F2B84B',
  textPrimary: '#F5F0EB',
  textSecondary: '#A69C93',
  textOnPrimary: '#14100E',
};

const sportLabels: Record<SportType, string> = {
  [SportType.BADMINTON]: 'Cầu lông',
  [SportType.FOOTBALL]: 'Bóng đá',
  [SportType.PICKLEBALL]: 'Pickleball',
  [SportType.TENNIS]: 'Tennis',
};

const statusLabels: Record<TournamentStatus, string> = {
  [TournamentStatus.UPCOMING]: 'Sắp mở',
  [TournamentStatus.OPEN]: 'Đang nhận đăng ký',
  [TournamentStatus.FULL]: 'Đã đủ suất',
  [TournamentStatus.IN_PROGRESS]: 'Đang thi đấu',
  [TournamentStatus.COMPLETED]: 'Đã kết thúc',
};

function formatDate(value?: Date | string) {
  if (!value) return 'Đang cập nhật';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatFee(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function getMinFee(tournament: Tournament) {
  const fees = tournament.categories?.map((category) => category.fee).filter((fee) => Number.isFinite(fee)) ?? [];
  return fees.length ? Math.min(...fees) : tournament.registrationFee ?? 0;
}

function getRules(tournament: Tournament) {
  return tournament.rules || tournament.rulesText || 'Ban tổ chức chưa cập nhật điều lệ chi tiết cho giải đấu này.';
}

export default function TournamentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useLogin();
  const isOrganizer = user?.role === UserRole.ORGANIZER;

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'schedule'>('overview');

  const loadTournament = async (refresh = false) => {
    if (!id) return;

    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      setErrorMessage(null);
      const data = await tournamentsApi.getTournamentDetails(id);
      setTournament(data);
    } catch (error) {
      console.error('Error loading tournament details:', error);
      setErrorMessage('Không tải được chi tiết giải đấu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTournament();
  }, [id]);

  const minFee = useMemo(() => (tournament ? getMinFee(tournament) : 0), [tournament]);
  const isOpen = tournament?.status === TournamentStatus.OPEN;

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor={colors.background}>
        <Spinner size="large" color={colors.primary} />
        <Text color={colors.textSecondary} marginTop="$3">Đang tải chi tiết giải đấu...</Text>
      </YStack>
    );
  }

  if (!tournament || errorMessage) {
    return (
      <YStack flex={1} backgroundColor={colors.background} padding="$5" paddingTop="$10" gap="$4">
        <Button
          alignSelf="flex-start"
          circular
          backgroundColor={colors.surface}
          borderColor={colors.surfaceBorder}
          borderWidth={1}
          onPress={() => router.back()}
          icon={<ChevronLeft color={colors.textPrimary} size={22} />}
        />
        <YStack flex={1} justifyContent="center" alignItems="center" gap="$3">
          <Text color={colors.textPrimary} fontSize={20} fontWeight="900">Không mở được giải đấu</Text>
          <Text color={colors.textSecondary} textAlign="center">{errorMessage}</Text>
          <Button backgroundColor={colors.primary} color={colors.textOnPrimary} onPress={() => loadTournament()}>
            Thử lại
          </Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      <YStack
        padding="$5"
        paddingTop="$8"
        backgroundColor={colors.backgroundSecondary}
        borderBottomWidth={1}
        borderBottomColor={colors.surfaceBorder}
        gap="$4"
      >
        <XStack alignItems="center" justifyContent="space-between">
          <Button
            circular
            size="$4"
            backgroundColor={colors.surface}
            borderColor={colors.surfaceBorder}
            borderWidth={1}
            onPress={() => router.back()}
            icon={<ChevronLeft color={colors.textPrimary} size={22} />}
          />
          <Text color={colors.textSecondary} fontSize={13} fontWeight="700">
            Chi tiết giải đấu
          </Text>
          <YStack width={42} />
        </XStack>

        <YStack gap="$3">
          <XStack gap="$2" alignItems="center" flexWrap="wrap">
            <YStack backgroundColor={isOpen ? colors.primaryMuted : 'rgba(242,184,75,0.15)'} borderColor={isOpen ? colors.primary : colors.warning} borderWidth={1} borderRadius="$10" paddingHorizontal="$3" paddingVertical="$1">
              <Text color={isOpen ? colors.primary : colors.warning} fontSize={12} fontWeight="900">
                {statusLabels[tournament.status]}
              </Text>
            </YStack>
            <YStack backgroundColor={colors.surface} borderColor={colors.surfaceBorder} borderWidth={1} borderRadius="$10" paddingHorizontal="$3" paddingVertical="$1">
              <Text color={colors.textPrimary} fontSize={12} fontWeight="900">
                {sportLabels[tournament.sport] ?? tournament.sport}
              </Text>
            </YStack>
          </XStack>

          <Text color={colors.textPrimary} fontSize={28} fontWeight="900" lineHeight={34}>
            {tournament.title}
          </Text>

          <XStack alignItems="center" gap="$2">
            <YStack width={34} height={34} borderRadius="$10" backgroundColor={colors.surfaceHover} alignItems="center" justifyContent="center">
              <Trophy color={colors.primary} size={18} />
            </YStack>
            <YStack flex={1}>
              <Text color={colors.textSecondary} fontSize={12}>Ban tổ chức</Text>
              <XStack alignItems="center" gap="$2">
                <Text color={colors.textPrimary} fontWeight="800">{tournament.organizer?.name || 'Đang cập nhật'}</Text>
                {tournament.organizer?.isVerified && <ShieldCheck color={colors.secondary} size={16} />}
              </XStack>
            </YStack>
          </XStack>
        </YStack>
      </YStack>

      <ScrollView
        flex={1}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadTournament(true)} />}
        contentContainerStyle={{ padding: 20, paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        <YStack gap="$4">
          <YStack backgroundColor={colors.surface} borderColor={colors.surfaceBorder} borderWidth={1} borderRadius="$5" padding="$4" gap="$4">
            <XStack gap="$3" alignItems="flex-start">
              <Calendar color={colors.primary} size={20} />
              <YStack flex={1}>
                <Text color={colors.textSecondary} fontSize={12}>Thời gian</Text>
                <Text color={colors.textPrimary} fontWeight="800" marginTop="$1">
                  {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                </Text>
              </YStack>
            </XStack>
            <XStack gap="$3" alignItems="flex-start">
              <MapPin color={colors.primary} size={20} />
              <YStack flex={1}>
                <Text color={colors.textSecondary} fontSize={12}>Địa điểm</Text>
                <Text color={colors.textPrimary} fontWeight="800" marginTop="$1">
                  {tournament.location}{tournament.district ? `, ${tournament.district}` : ''}, {tournament.city}
                </Text>
              </YStack>
            </XStack>
            <XStack gap="$3" alignItems="flex-start">
              <Users color={colors.primary} size={20} />
              <YStack flex={1}>
                <Text color={colors.textSecondary} fontSize={12}>Hạng mục</Text>
                <Text color={colors.textPrimary} fontWeight="800" marginTop="$1">
                  {tournament.categories?.length ? `${tournament.categories.length} hạng mục thi đấu` : 'Đang cập nhật'}
                </Text>
              </YStack>
            </XStack>
          </YStack>

          <XStack gap="$2">
            {[
              { key: 'overview', label: 'Tổng quan' },
              { key: 'rules', label: 'Điều lệ' },
              { key: 'schedule', label: 'Lịch trình' },
            ].map((tab) => (
              <Button
                key={tab.key}
                flex={1}
                size="$3"
                borderRadius="$10"
                backgroundColor={activeTab === tab.key ? colors.primary : colors.surface}
                color={activeTab === tab.key ? colors.textOnPrimary : colors.textPrimary}
                onPress={() => setActiveTab(tab.key as typeof activeTab)}
              >
                {tab.label}
              </Button>
            ))}
          </XStack>

          {activeTab === 'overview' && (
            <YStack gap="$4">
              <YStack gap="$2">
                <Text color={colors.textPrimary} fontSize={18} fontWeight="900">Giới thiệu</Text>
                <Text color={colors.textSecondary} fontSize={15} lineHeight={23}>
                  {tournament.description || 'Ban tổ chức chưa cập nhật phần mô tả.'}
                </Text>
              </YStack>

              <YStack gap="$3">
                <Text color={colors.textPrimary} fontSize={18} fontWeight="900">Lệ phí theo hạng mục</Text>
                {tournament.categories?.length ? (
                  tournament.categories.map((category, index) => (
                    <XStack
                      key={category.id || `${category.name}-${index}`}
                      justifyContent="space-between"
                      alignItems="center"
                      backgroundColor={colors.surface}
                      borderColor={colors.surfaceBorder}
                      borderWidth={1}
                      borderRadius="$4"
                      padding="$3"
                    >
                      <YStack flex={1} paddingRight="$3">
                        <Text color={colors.textPrimary} fontWeight="800">{category.name}</Text>
                        <Text color={colors.textSecondary} fontSize={12}>
                          {category.maxParticipants ? `Tối đa ${category.maxParticipants} người/đội` : 'Không giới hạn hiển thị'}
                        </Text>
                      </YStack>
                      <Text color={colors.primary} fontWeight="900">{formatFee(category.fee)}</Text>
                    </XStack>
                  ))
                ) : (
                  <Text color={colors.textSecondary}>Chưa có hạng mục thi đấu.</Text>
                )}
              </YStack>
            </YStack>
          )}

          {activeTab === 'rules' && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <FileText color={colors.primary} size={19} />
                <Text color={colors.textPrimary} fontSize={18} fontWeight="900">Điều lệ giải đấu</Text>
              </XStack>
              <Text color={colors.textSecondary} fontSize={15} lineHeight={24}>
                {getRules(tournament)}
              </Text>
              {tournament.rulesFileUrl && (
                <Button
                  alignSelf="flex-start"
                  backgroundColor={colors.surface}
                  color={colors.textPrimary}
                  borderColor={colors.surfaceBorder}
                  borderWidth={1}
                  onPress={() => Alert.alert('Điều lệ PDF', 'Tệp điều lệ đã có trong dữ liệu giải. Trình xem PDF sẽ được nối ở bước sau.')}
                >
                  Xem file điều lệ
                </Button>
              )}
            </YStack>
          )}

          {activeTab === 'schedule' && (
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Clock color={colors.primary} size={19} />
                <Text color={colors.textPrimary} fontSize={18} fontWeight="900">Lịch trình dự kiến</Text>
              </XStack>
              {tournament.schedule?.length ? (
                tournament.schedule.map((item, index) => (
                  <XStack key={`${item}-${index}`} gap="$3" alignItems="flex-start">
                    <YStack width={28} height={28} borderRadius="$10" backgroundColor={colors.primaryMuted} alignItems="center" justifyContent="center">
                      <Text color={colors.primary} fontSize={12} fontWeight="900">{index + 1}</Text>
                    </YStack>
                    <Text flex={1} color={colors.textSecondary} fontSize={15} lineHeight={22}>{item}</Text>
                  </XStack>
                ))
              ) : (
                <Text color={colors.textSecondary}>Ban tổ chức chưa cập nhật lịch trình chi tiết.</Text>
              )}
            </YStack>
          )}
        </YStack>
      </ScrollView>

      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        padding="$5"
        paddingBottom="$7"
        backgroundColor="rgba(30,24,21,0.97)"
        borderTopWidth={1}
        borderTopColor={colors.surfaceBorder}
        gap="$3"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text color={colors.textSecondary} fontSize={12}>Lệ phí từ</Text>
            <Text color={colors.primary} fontSize={24} fontWeight="900">{formatFee(minFee)}</Text>
          </YStack>
          <Text color={colors.textSecondary} fontSize={12}>ID: {String(id).slice(0, 8)}...</Text>
        </XStack>
        <Button
          height={54}
          borderRadius="$5"
          backgroundColor={isOpen ? colors.primary : colors.surfaceHover}
          color={isOpen ? colors.textOnPrimary : colors.textSecondary}
          fontWeight="900"
          disabled={!isOpen && !isOrganizer}
          opacity={!isOpen && !isOrganizer ? 0.6 : 1}
          onPress={() => {
            if (isOrganizer) {
              router.push('/tracker');
              return;
            }

            if (isOpen) {
              router.push(`/register/${id}`);
              return;
            }

            Alert.alert('Chưa thể đăng ký', 'Giải đấu hiện chưa mở hoặc đã ngừng nhận đăng ký.');
          }}
        >
          {isOrganizer ? 'Xem danh sách đăng ký' : isOpen ? 'Đăng ký thi đấu' : 'Chưa mở đăng ký'}
        </Button>
      </YStack>
    </YStack>
  );
}
