import React, { useState, useEffect } from 'react';
import { YStack, XStack, H2, H4, Paragraph, Text, ScrollView, Spinner } from 'tamagui';
import { LogOut, Search, Navigation, User as UserIcon, Calendar, MapPin, Trophy, ChevronRight } from 'lucide-react-native';
import { useLogin } from '../../auth/hooks/useLogin';
import { UserRole } from '@courtmate/shared';
import { router } from 'expo-router';
import { apiClient } from '../../../services/api-client';

interface TournamentItem {
  id?: string;
  _id?: string;
  title: string;
  sport: string;
  location: string;
  registrationFee: number;
}

export const DashboardScreen: React.FC = () => {
  const { user, logout } = useLogin();
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await apiClient.get<TournamentItem[]>(`${BASE_URL}/registrations/tournaments`);
        setTournaments(data);
      } catch (e) {
        setTournaments([
          {
            _id: '64957e841234567890abcdef1',
            title: 'Giải vô địch Cầu lông Phong trào Đà Nẵng 2026',
            sport: 'BADMINTON',
            location: 'Nhà thi đấu TDTT Đà Nẵng',
            registrationFee: 200000,
          },
          {
            _id: '64957e841234567890abcdef2',
            title: 'Danang Pickleball Open 2026',
            sport: 'PICKLEBALL',
            location: 'Sân Pickleball Sơn Trà',
            registrationFee: 150000,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
    loadTournaments();
  }, []);

  return (
    <YStack f={1} bg="#0A0A0A">
      
      {/* Header */}
      <XStack p="$5" pt="$8" jc="space-between" ai="center" bg="rgba(20,20,20,0.8)" borderBottomWidth={1} borderBottomColor="rgba(255,255,255,0.05)">
        <YStack>
          <Paragraph color="#C4F82A" fos={12} tt="uppercase" fow="700" ls={1}>
            CourtMate Hub
          </Paragraph>
          <H2 color="white" fow="800">Khám phá Giải đấu</H2>
        </YStack>
        <YStack
          bg="rgba(255,255,255,0.1)"
          w={40}
          h={40}
          br={20}
          jc="center"
          ai="center"
          onPress={logout}
          pressStyle={{ scale: 0.9 }}
        >
          <LogOut color="white" size={18} />
        </YStack>
      </XStack>

      {/* Main Content */}
      <ScrollView f={1} p="$5">
        <YStack gap="$4" pb="$8">
          <XStack jc="space-between" ai="center" mb="$2">
            <Paragraph color="rgba(255,255,255,0.8)" fos={16} fow="600">
              Sắp diễn ra tại <Text color="#C4F82A" fow="700">{user?.preferences?.location || 'Đà Nẵng'}</Text>
            </Paragraph>
            {user?.role === UserRole.ORGANIZER && (
              <YStack bg="rgba(196, 248, 42, 0.2)" px="$3" py="$1.5" br="$4">
                <Text color="#C4F82A" fos={12} fow="700">+ Tạo giải</Text>
              </YStack>
            )}
          </XStack>

          {isLoading ? (
            <YStack f={1} ai="center" jc="center" mt="$10">
              <Spinner size="large" color="#C4F82A" />
            </YStack>
          ) : (
            tournaments.map((item) => {
              const id = item._id || item.id;
              const isPickleball = item.sport === 'PICKLEBALL';
              const sportColor = isPickleball ? '#C4F82A' : '#3B82F6';
              const sportBg = isPickleball ? 'rgba(196, 248, 42, 0.1)' : 'rgba(59, 130, 246, 0.1)';

              return (
                <YStack
                  key={id}
                  bg="rgba(20,20,20,0.6)"
                  br="$6"
                  p="$4"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.08)"
                  pressStyle={{ scale: 0.98, opacity: 0.9 }}
                  animation="quick"
                  onPress={() => router.push(`/tournament/${id}`)}
                >
                  <YStack gap="$3">
                    <XStack jc="space-between" ai="center">
                      <YStack px="$3" py="$1" br="$4" bg={sportBg} borderWidth={1} borderColor={sportColor}>
                        <Text fos={12} fow="700" color={sportColor}>{item.sport}</Text>
                      </YStack>
                      <Text fos={13} color="rgba(255,255,255,0.5)" fow="600">
                        Phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.registrationFee)}
                      </Text>
                    </XStack>

                    <H4 color="white" fow="800" lh={28}>{item.title}</H4>

                    <XStack gap="$2" ai="center">
                      <MapPin color="rgba(255,255,255,0.5)" size={16} />
                      <Text fos={14} color="rgba(255,255,255,0.6)">{item.location}</Text>
                    </XStack>

                    <YStack mt="$2" h={44} bg={sportColor} br="$4" jc="center" ai="center">
                      <XStack gap="$2" ai="center">
                        <Text color="#0A0A0A" fow="800" textTransform="uppercase">Chi tiết giải đấu</Text>
                        <ChevronRight color="#0A0A0A" size={18} />
                      </XStack>
                    </YStack>
                  </YStack>
                </YStack>
              );
            })
          )}
        </YStack>
      </ScrollView>

    </YStack>
  );
};

export default DashboardScreen;
