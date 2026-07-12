import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, RefreshControl, TextInput } from 'react-native';
import { Button, Input, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';
import {
  Calendar,
  ChevronRight,
  Filter,
  LogOut,
  MapPin,
  Search,
  ShieldCheck,
  Trophy,
  User as UserIcon,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { SportType, Tournament, TournamentFilterDto, TournamentStatus, UserRole } from '@courtmate/shared';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { useLogin } from '../../auth/hooks/useLogin';

const colors = {
  background: '#F4FBF7',
  backgroundSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  surfaceBorder: 'rgba(5, 150, 105, 0.08)',
  primary: '#059669',
  primaryMuted: 'rgba(5, 150, 105, 0.08)',
  secondary: '#1E293B',
  secondaryMuted: 'rgba(30, 41, 59, 0.05)',
  warning: '#D97706',
  textPrimary: '#062F21',
  textSecondary: '#476F62',
  textDisabled: '#A7C2B7',
  textOnPrimary: '#FFFFFF',
  divider: 'rgba(5, 150, 105, 0.06)',
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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}

function getTournamentId(tournament: Tournament) {
  return tournament.id || (tournament as any)._id;
}

function getMinFee(tournament: Tournament) {
  const fees = tournament.categories?.map((category) => category.fee).filter((fee) => Number.isFinite(fee)) ?? [];
  return fees.length ? Math.min(...fees) : tournament.registrationFee ?? 0;
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useLogin();
  const isOrganizer = user?.role === UserRole.ORGANIZER;
  const searchRef = useRef<TextInput>(null);

  const [query, setQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<SportType | undefined>();
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 300);
  const city = user?.preferences?.location || 'Da Nang';

  const filters = useMemo<TournamentFilterDto>(
    () => ({
      city,
      keyword: debouncedQuery || undefined,
      sport: selectedSport,
      status: onlyOpen ? TournamentStatus.OPEN : undefined,
    }),
    [city, debouncedQuery, onlyOpen, selectedSport],
  );

  const loadTournaments = useCallback(
    async (nextFilters: TournamentFilterDto, refresh = false) => {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setErrorMessage(null);
        const response = await tournamentsApi.getTournaments(nextFilters);
        setTournaments(response.data ?? []);
        setIsFallback(Boolean(response.meta?.isFallback));
      } catch (error) {
        console.error('Error loading tournaments:', error);
        setErrorMessage('Không tải được danh sách giải đấu. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadTournaments(filters);
  }, [filters, loadTournaments]);

  const resetSearch = () => {
    setQuery('');
    setSelectedSport(undefined);
    setOnlyOpen(false);
  };

  const totalOpen = tournaments.filter((tournament) => tournament.status === TournamentStatus.OPEN).length;

  return (
    <YStack flex={1} backgroundColor={colors.background}>
      <YStack padding="$5" paddingTop="$8" gap="$4" backgroundColor={colors.backgroundSecondary}>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1} paddingRight="$3">
            <Text color={isOrganizer ? colors.secondary : colors.primary} fontSize={12} fontWeight="800" textTransform="uppercase">
              {isOrganizer ? 'Organizer Console' : 'Tournament Hub'}
            </Text>
            <Text color={colors.textPrimary} fontSize={26} fontWeight="900" lineHeight={32}>
              {isOrganizer ? 'Quản lý giải đấu' : 'Khám phá giải đấu'}
            </Text>
            <Text color={colors.textSecondary} fontSize={14} marginTop="$1">
              {isOrganizer ? 'Theo dõi giải bạn tổ chức và nhu cầu người chơi' : `Các giải phù hợp tại ${city}`}
            </Text>
          </YStack>

          <Button
            circular
            size="$4"
            backgroundColor={colors.surface}
            borderColor={colors.surfaceBorder}
            borderWidth={1}
            onPress={async () => {
              try {
                console.log('Dashboard logout button clicked');
                await logout();
                console.log('Dashboard logout call finished, redirecting...');
                router.replace('/');
              } catch (err) {
                console.error('Error during dashboard logout button click:', err);
                Alert.alert('Lỗi', 'Không thể đăng xuất. Chi tiết: ' + String(err));
              }
            }}
            icon={<LogOut color={colors.textPrimary} size={18} />}
          />
        </XStack>

        <XStack gap="$3">
          <YStack flex={1} backgroundColor="rgba(5, 150, 105, 0.04)" borderColor="rgba(5, 150, 105, 0.08)" borderWidth={1} borderRadius="$5" padding="$3">
            <Text color={colors.textSecondary} fontSize={12}>
              {isOrganizer ? 'Giải đang hiển thị' : 'Giải tìm thấy'}
            </Text>
            <Text color={colors.textPrimary} fontSize={24} fontWeight="900">
              {tournaments.length}
            </Text>
          </YStack>
          <YStack flex={1} backgroundColor={isOrganizer ? colors.secondaryMuted : colors.primaryMuted} borderColor={isOrganizer ? colors.secondary : colors.primary} borderWidth={1} borderRadius="$5" padding="$3">
            <Text color={colors.textSecondary} fontSize={12}>
              Đang nhận đăng ký
            </Text>
            <Text color={isOrganizer ? colors.secondary : colors.primary} fontSize={24} fontWeight="900">
              {totalOpen}
            </Text>
          </YStack>
        </XStack>

        <XStack
          alignItems="center"
          gap="$2"
          backgroundColor="rgba(5, 150, 105, 0.04)"
          borderColor="rgba(5, 150, 105, 0.08)"
          borderWidth={1}
          borderRadius="$5"
          paddingHorizontal="$3"
        >
          <Search color={colors.textSecondary} size={18} />
          <Input
            ref={searchRef}
            flex={1}
            value={query}
            onChangeText={setQuery}
            placeholder={isOrganizer ? 'Tìm theo tên giải hoặc đơn vị tổ chức' : 'Tìm giải đấu, địa điểm, ban tổ chức'}
            placeholderTextColor={colors.textDisabled}
            color={colors.textPrimary}
            backgroundColor="transparent"
            borderWidth={0}
            paddingHorizontal="$1"
          />
          <Button
            size="$3"
            chromeless
            onPress={() => setOnlyOpen((value) => !value)}
            icon={<Filter color={onlyOpen ? colors.primary : colors.textSecondary} size={17} />}
          />
        </XStack>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" paddingBottom="$1">
            <Button
              size="$3"
              borderRadius="$10"
              backgroundColor={!selectedSport ? colors.primary : "rgba(5, 150, 105, 0.05)"}
              color={!selectedSport ? colors.textOnPrimary : colors.textPrimary}
              onPress={() => setSelectedSport(undefined)}
            >
              Tất cả
            </Button>
            {Object.values(SportType).map((sport) => (
              <Button
                key={sport}
                size="$3"
                borderRadius="$10"
                backgroundColor={selectedSport === sport ? colors.primary : "rgba(5, 150, 105, 0.05)"}
                color={selectedSport === sport ? colors.textOnPrimary : colors.textPrimary}
                onPress={() => setSelectedSport(sport)}
              >
                {sportLabels[sport]}
              </Button>
            ))}
          </XStack>
        </ScrollView>
      </YStack>

      {isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color={colors.primary} />
          <Text color={colors.textSecondary} marginTop="$3">Đang tải giải đấu...</Text>
        </YStack>
      ) : (
        <ScrollView
          flex={1}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadTournaments(filters, true)} />}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <YStack gap="$4">
            {isFallback && (
              <YStack backgroundColor={colors.primaryMuted} borderColor={colors.primary} borderWidth={1} borderRadius="$5" padding="$4" gap="$1">
                <Text color={colors.primary} fontWeight="800">Chưa có giải phù hợp tại {city}</Text>
                <Text color={colors.textSecondary}>CourtMate đang hiển thị thêm các giải nổi bật ở khu vực khác.</Text>
              </YStack>
            )}

            {errorMessage && (
              <YStack backgroundColor="rgba(232,72,59,0.15)" borderColor="#E8483B" borderWidth={1} borderRadius="$5" padding="$4">
                <Text color="#E8483B" fontWeight="800">{errorMessage}</Text>
              </YStack>
            )}

            {!errorMessage && tournaments.length === 0 ? (
              <YStack alignItems="center" justifyContent="center" paddingVertical="$10" gap="$3">
                <Text color={colors.textPrimary} fontSize={18} fontWeight="800">Không tìm thấy giải phù hợp</Text>
                <Text color={colors.textSecondary} textAlign="center">Thử đổi từ khóa, môn thi đấu hoặc bỏ lọc “đang nhận đăng ký”.</Text>
                <Button backgroundColor={colors.primary} color={colors.textOnPrimary} onPress={resetSearch}>
                  Xóa bộ lọc
                </Button>
              </YStack>
            ) : (
              tournaments.map((tournament) => {
                const tournamentId = getTournamentId(tournament);
                const isOpen = tournament.status === TournamentStatus.OPEN;
                const accent = isOpen ? colors.primary : colors.warning;
                const minFee = getMinFee(tournament);

                return (
                  <YStack
                    key={tournamentId}
                    backgroundColor={colors.surface}
                    borderColor={colors.surfaceBorder}
                    borderWidth={1}
                    borderRadius={14}
                    shadowColor="rgba(5, 150, 105, 0.08)"
                    shadowOffset={{ width: 0, height: 4 }}
                    shadowOpacity={1}
                    shadowRadius={12}
                    elevation={2}
                    overflow="hidden"
                    pressStyle={{ scale: 0.98, opacity: 0.92 }}
                    animation="quick"
                    onPress={() => router.push(`/tournament/${tournamentId}`)}
                  >
                    <YStack padding="$4" gap="$3">
                      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3">
                        <YStack flex={1} gap="$2">
                          <XStack gap="$2" alignItems="center" flexWrap="wrap">
                            <YStack backgroundColor={isOpen ? colors.primaryMuted : 'rgba(242,184,75,0.15)'} borderColor={accent} borderWidth={1} borderRadius="$10" paddingHorizontal="$3" paddingVertical="$1">
                              <Text color={accent} fontSize={12} fontWeight="800">{statusLabels[tournament.status]}</Text>
                            </YStack>
                            {tournament.organizer?.isVerified && (
                              <XStack alignItems="center" gap="$1" backgroundColor={colors.secondaryMuted} borderRadius="$10" paddingHorizontal="$2" paddingVertical="$1">
                                <ShieldCheck color={colors.secondary} size={13} />
                                <Text color={colors.secondary} fontSize={11} fontWeight="800">Verified</Text>
                              </XStack>
                            )}
                          </XStack>
                          <Text color={colors.textPrimary} fontSize={20} fontWeight="900" lineHeight={26}>
                            {tournament.title}
                          </Text>
                        </YStack>
                        <Text color={colors.primary} fontSize={13} fontWeight="900">
                          {sportLabels[tournament.sport] ?? tournament.sport}
                        </Text>
                      </XStack>

                      <XStack gap="$2" alignItems="center">
                        <Calendar color={colors.textSecondary} size={16} />
                        <Text color={colors.textSecondary} fontSize={14}>{formatDate(tournament.startDate)}</Text>
                      </XStack>

                      <XStack gap="$2" alignItems="center">
                        <MapPin color={colors.textSecondary} size={16} />
                        <Text flex={1} color={colors.textSecondary} fontSize={14} numberOfLines={1}>
                          {tournament.location}{tournament.district ? `, ${tournament.district}` : ''}, {tournament.city}
                        </Text>
                      </XStack>

                      <XStack justifyContent="space-between" alignItems="center" borderTopColor={colors.divider} borderTopWidth={1} paddingTop="$3">
                        <YStack>
                          <Text color={colors.textSecondary} fontSize={12}>{isOrganizer ? 'Lệ phí niêm yết' : 'Lệ phí từ'}</Text>
                          <Text color={colors.textPrimary} fontSize={18} fontWeight="900">
                            {minFee.toLocaleString('vi-VN')}đ
                          </Text>
                        </YStack>
                        <XStack alignItems="center" gap="$2" backgroundColor={colors.primary} borderRadius="$4" paddingHorizontal="$4" height={42}>
                          <Text color={colors.textOnPrimary} fontWeight="900">
                            {isOrganizer ? 'Xem vận hành' : 'Chi tiết'}
                          </Text>
                          <ChevronRight color={colors.textOnPrimary} size={18} />
                        </XStack>
                      </XStack>
                    </YStack>
                  </YStack>
                );
              })
            )}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
};

export default DashboardScreen;
