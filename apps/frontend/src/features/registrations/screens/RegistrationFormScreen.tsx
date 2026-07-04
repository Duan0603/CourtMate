import React from 'react';
import { YStack, H3, Paragraph, ScrollView, XStack, Text } from 'tamagui';
import { useLocalSearchParams, router } from 'expo-router';
import { useRegistrations } from '../hooks/useRegistrations';
import { RegistrationForm } from '../components/RegistrationForm';
import { ChevronLeft, ClipboardList } from 'lucide-react-native';

export const RegistrationFormScreen: React.FC = () => {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const { submitRegistration, isSubmitting, error } = useRegistrations();

  const mockPlayerId = '64957e841234567890abcdef'; // Nguyen Van Cau Thu (seeded ID format)

  const handleFormSubmit = async (formData: any) => {
    try {
      await submitRegistration(
        {
          tournamentId,
          ...formData,
        },
        mockPlayerId
      );
      // Success - redirect to tracker
      router.push('/tracker');
    } catch (e) {
      console.error('Registration submit error:', e);
    }
  };

  return (
    <YStack bg="#0A0A0A" f={1}>
      
      {/* Header */}
      <XStack p="$5" pt="$10" ai="center" gap="$3" bg="rgba(20,20,20,0.8)" borderBottomWidth={1} borderBottomColor="rgba(255,255,255,0.05)">
        <YStack w={40} h={40} br={20} bg="rgba(255,255,255,0.1)" jc="center" ai="center" onPress={() => router.back()}>
          <ChevronLeft color="white" size={24} />
        </YStack>
        <Text color="white" fow="700" fos={18}>Đăng ký thi đấu</Text>
      </XStack>

      <ScrollView f={1} p="$5" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack gap="$5">
          <YStack ai="center" gap="$2" mb="$2">
            <YStack w={60} h={60} br={30} bg="rgba(196, 248, 42, 0.1)" jc="center" ai="center" mb="$2">
              <ClipboardList color="#C4F82A" size={28} />
            </YStack>
            <H3 col="white" ta="center" fow="800">
              Hoàn thiện hồ sơ
            </H3>
            <Paragraph col="rgba(255,255,255,0.5)" ta="center" fos={14}>
              Mã giải đấu: {tournamentId?.substring(0,8)}...
            </Paragraph>
          </YStack>

          <YStack bg="rgba(20,20,20,0.6)" br="$6" p="$5" borderWidth={1} borderColor="rgba(255,255,255,0.08)">
            <RegistrationForm
              onSubmit={handleFormSubmit}
              isLoading={isSubmitting}
              errorMessage={error}
            />
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
};

export default RegistrationFormScreen;
