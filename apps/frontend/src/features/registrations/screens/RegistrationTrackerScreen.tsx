import React, { useEffect } from 'react';
import { YStack, H3, Paragraph, ScrollView, XStack, Spinner, Text } from 'tamagui';
import { router } from 'expo-router';
import { useRegistrations } from '../hooks/useRegistrations';
import { RegistrationStatusCard } from '../components/RegistrationStatusCard';
import { Button } from '../../../components';

export const RegistrationTrackerScreen: React.FC = () => {
  const {
    registrations,
    isLoading,
    error,
    fetchRegistrations,
    simulatePayment,
  } = useRegistrations();

  const mockPlayerId = '64957e841234567890abcdef'; // Nguyen Van Cau Thu (seeded ID)

  useEffect(() => {
    fetchRegistrations(mockPlayerId);
  }, [fetchRegistrations]);

  return (
    <YStack bg="$background" f={1} p="$5" mt="$8" gap="$4">
      <XStack w="100%" jc="space-between" ai="center">
        <Button
          size="$3.5"
          onPress={() => router.replace('/')}
          theme="alt1"
          bg="$backgroundHover"
          br="$3"
        >
          Trang chủ
        </Button>
        <Button
          size="$3.5"
          onPress={() => fetchRegistrations(mockPlayerId)}
          theme="alt2"
          bg="$backgroundHover"
          br="$3"
        >
          Làm mới
        </Button>
      </XStack>

      <YStack mb="$2">
        <H3 col="$color" fow="bold">
          Lịch sử Đăng ký
        </H3>
        <Paragraph col="$colorMuted" fos="$3">
          Theo dõi trạng thái tham gia giải đấu của bạn.
        </Paragraph>
      </YStack>

      {isLoading ? (
        <YStack f={1} ai="center" jc="center">
          <Spinner size="large" color="#ff5e3a" />
          <Text col="$colorMuted" mt="$2" fos="$3">
            Đang tải dữ liệu...
          </Text>
        </YStack>
      ) : error ? (
        <YStack f={1} ai="center" jc="center" p="$4" gap="$2">
          <Text col="$red10" fow="bold" ta="center">
            {error}
          </Text>
          <Button size="$3.5" onPress={() => fetchRegistrations(mockPlayerId)}>
            Thử lại
          </Button>
        </YStack>
      ) : registrations.length === 0 ? (
        <YStack f={1} ai="center" jc="center" p="$6" gap="$4">
          <Paragraph col="$colorMuted" ta="center" fos="$4">
            Bạn chưa đăng ký tham gia giải đấu nào.
          </Paragraph>
          <Button
            size="$4"
            bg="#ff5e3a"
            col="#ffffff"
            onPress={() => router.push('/')}
          >
            Tìm giải đấu ngay
          </Button>
        </YStack>
      ) : (
        <ScrollView f={1} showsVerticalScrollIndicator={false}>
          <YStack gap="$3.5" pb="$10">
            {registrations.map((reg) => (
              <RegistrationStatusCard
                key={reg.id || (reg as any)._id}
                registration={reg}
                onSimulatePayment={simulatePayment}
              />
            ))}
          </YStack>
        </ScrollView>
      )}
    </YStack>
  );
};

export default RegistrationTrackerScreen;
