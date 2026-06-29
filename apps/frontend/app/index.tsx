import React, { useState, useEffect } from 'react';
import { YStack, H1, Paragraph, Text, ScrollView, XStack, Card, Spinner, ThemeableStack } from 'tamagui';
import { router } from 'expo-router';
import { Button } from '../src/components';
import { apiClient } from '../src/services/api-client';

interface TournamentItem {
  id?: string;
  _id?: string;
  title: string;
  sport: string;
  location: string;
  registrationFee: number;
}

export default function Home() {
  const [tournaments, setTournaments] = useState<TournamentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    async function loadTournaments() {
      try {
        const data = await apiClient.get<TournamentItem[]>(`${BASE_URL}/registrations/tournaments`);
        setTournaments(data);
      } catch (e) {
        console.log('Using local mock tournaments (offline/development mode)');
        // Graceful fallback to initial mock tournaments matching seeded DB structure
        setTournaments([
          {
            _id: '64957e841234567890abcdef1', // Mock Badminton Tournament ID
            title: 'Giải vô địch Cầu lông Phong trào Đà Nẵng 2026',
            sport: 'BADMINTON',
            location: 'Nhà thi đấu TDTT Đà Nẵng, Phan Đăng Lưu',
            registrationFee: 200000,
          },
          {
            _id: '64957e841234567890abcdef2', // Mock Pickleball Tournament ID
            title: 'Danang Pickleball Open 2026',
            sport: 'PICKLEBALL',
            location: 'Sân Pickleball Sơn Trà, Đà Nẵng',
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
    <YStack f={1} bg="$background" p="$5" mt="$8" gap="$4">
      {/* Header Row */}
      <XStack jc="space-between" ai="center" w="100%">
        <YStack>
          <H1 col="#ff5e3a" fos="$7" fow="bold">
            CourtMate
          </H1>
          <Paragraph col="$colorMuted" fos="$2.5">
            Sports Tournaments Hub
          </Paragraph>
        </YStack>
        <Button
          size="$3.5"
          bg="$backgroundHover"
          borderColor="#ff5e3a"
          borderWidth={1}
          br="$4"
          onPress={() => router.push('/tracker')}
        >
          <Text fow="bold" col="#ff5e3a" fos="$2.5">
            Hồ sơ đăng ký
          </Text>
        </Button>
      </XStack>

      <Paragraph fos="$4" col="$color" fow="bold" mt="$2">
        Giải Đấu Nổi Bật Đà Nẵng
      </Paragraph>

      {isLoading ? (
        <YStack f={1} ai="center" jc="center">
          <Spinner size="large" color="#ff5e3a" />
        </YStack>
      ) : (
        <ScrollView f={1} showsVerticalScrollIndicator={false}>
          <YStack gap="$4" pb="$8">
            {tournaments.map((item) => {
              const id = item._id || item.id || 'mock-id';
              const isPickleball = item.sport === 'PICKLEBALL';
              return (
                <Card
                  key={id}
                  p="$4"
                  bg="$backgroundHover"
                  br="$5"
                  borderWidth={1}
                  borderColor="$borderColor"
                  hoverStyle={{ scale: 0.98 }}
                  onPress={() => router.push(`/tournament/${id}`)}
                >
                  <YStack gap="$2.5">
                    <XStack jc="space-between" ai="center">
                      <ThemeableStack
                        px="$2.5"
                        py="$0.5"
                        br="$3"
                        bg={isPickleball ? 'rgba(76, 175, 80, 0.1)' : 'rgba(2, 136, 209, 0.1)'}
                        borderColor={isPickleball ? '#4caf50' : '#0288d1'}
                        borderWidth={1}
                      >
                        <Text fos="$2" fow="bold" col={isPickleball ? '#4caf50' : '#0288d1'}>
                          {item.sport}
                        </Text>
                      </ThemeableStack>
                      <Text fos="$2.5" col="$colorMuted">
                        Phí: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.registrationFee)}
                      </Text>
                    </XStack>

                    <Text fow="bold" fos="$4.5" col="$color" lh="$5">
                      {item.title}
                    </Text>

                    <XStack gap="$1.5" ai="center">
                      <Text fos="$2" col="$colorMuted">
                        📍 {item.location}
                      </Text>
                    </XStack>

                    <Button
                      bg="#ff5e3a"
                      col="#ffffff"
                      size="$3.5"
                      br="$3"
                      mt="$2"
                      onPress={() => router.push(`/tournament/${id}`)}
                    >
                      <Text fow="bold" col="#ffffff" fos="$3">
                        Chi tiết giải đấu
                      </Text>
                    </Button>
                  </YStack>
                </Card>
              );
            })}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
}
