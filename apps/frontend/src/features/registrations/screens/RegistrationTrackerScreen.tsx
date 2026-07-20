import React, { useEffect } from 'react';
import { YStack, H3, Paragraph, ScrollView, XStack, Spinner, Text } from 'tamagui';
import { router } from 'expo-router';
import { useRegistrations } from '../hooks/useRegistrations';
import { RegistrationStatusCard } from '../components/RegistrationStatusCard';
import { ChevronLeft, RefreshCw, ClipboardList } from 'lucide-react-native';

export const RegistrationTrackerScreen: React.FC = () => {
  const {
    registrations,
    isLoading,
    error,
    fetchRegistrations,
  } = useRegistrations();

  const mockPlayerId = '64957e841234567890abcdef'; // Nguyen Van Cau Thu (seeded ID)

  useEffect(() => {
    fetchRegistrations(mockPlayerId);
  }, [fetchRegistrations]);

  return (
    <YStack bg="#0A0A0A" f={1}>
      
      {/* Header */}
      <XStack p="$5" pt="$10" ai="center" jc="space-between" bg="rgba(20,20,20,0.8)" borderBottomWidth={1} borderBottomColor="rgba(255,255,255,0.05)">
        <YStack w={40} h={40} br={20} bg="rgba(255,255,255,0.1)" jc="center" ai="center" onPress={() => router.replace('/')}>
          <ChevronLeft color="white" size={24} />
        </YStack>
        <Text color="white" fow="700" fos={18}>Hồ sơ Đăng ký</Text>
        <YStack w={40} h={40} br={20} bg="rgba(196, 248, 42, 0.1)" jc="center" ai="center" onPress={() => fetchRegistrations(mockPlayerId)}>
          <RefreshCw color="#C4F82A" size={20} />
        </YStack>
      </XStack>

      {/* Main Content */}
      <YStack f={1} p="$5">
        <YStack mb="$4">
          <H3 col="white" fow="800">
            Lịch sử Đăng ký
          </H3>
          <Paragraph col="rgba(255,255,255,0.5)" fos={14}>
            Theo dõi trạng thái tham gia giải đấu của bạn.
          </Paragraph>
        </YStack>

        {isLoading ? (
          <YStack f={1} ai="center" jc="center">
            <Spinner size="large" color="#C4F82A" />
            <Text col="rgba(255,255,255,0.5)" mt="$4" fos={14}>
              Đang tải dữ liệu...
            </Text>
          </YStack>
        ) : error ? (
          <YStack f={1} ai="center" jc="center" p="$4" gap="$4">
            <Text col="#F87171" fow="600" ta="center">
              {error}
            </Text>
            <YStack bg="#C4F82A" px="$5" py="$3" br="$4" onPress={() => fetchRegistrations(mockPlayerId)}>
              <Text color="#0A0A0A" fow="700">Thử lại</Text>
            </YStack>
          </YStack>
        ) : registrations.length === 0 ? (
          <YStack f={1} ai="center" jc="center" p="$6" gap="$4">
            <YStack w={80} h={80} br={40} bg="rgba(255,255,255,0.05)" jc="center" ai="center" mb="$2">
              <ClipboardList color="rgba(255,255,255,0.3)" size={40} />
            </YStack>
            <Paragraph col="rgba(255,255,255,0.5)" ta="center" fos={15}>
              Bạn chưa đăng ký tham gia giải đấu nào.
            </Paragraph>
            <YStack
              bg="#C4F82A"
              h={50}
              px="$6"
              br="$4"
              jc="center"
              ai="center"
              onPress={() => router.replace('/')}
              mt="$2"
            >
              <Text color="#0A0A0A" fow="800" textTransform="uppercase">
                Tìm giải đấu ngay
              </Text>
            </YStack>
          </YStack>
        ) : (
          <ScrollView f={1} showsVerticalScrollIndicator={false}>
            <YStack gap="$4" pb="$10">
              {registrations.map((reg) => (
                <YStack key={reg.id || (reg as any)._id} bg="rgba(20,20,20,0.6)" br="$6" p="$4" borderWidth={1} borderColor="rgba(255,255,255,0.08)">
                  <RegistrationStatusCard
                    registration={reg}
                    onPay={(registration) => router.push({ pathname: `/payment/${registration.tournamentId}` as any, params: { registrationId: registration.id || (registration as any)._id } })}
                  />
                </YStack>
              ))}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </YStack>
  );
};

export default RegistrationTrackerScreen;
