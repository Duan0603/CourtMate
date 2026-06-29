import React from 'react';
import { YStack, H3, Paragraph, ScrollView, XStack } from 'tamagui';
import { useLocalSearchParams, router } from 'expo-router';
import { useRegistrations } from '../hooks/useRegistrations';
import { RegistrationForm } from '../components/RegistrationForm';
import { Button } from '../../../components';

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
    <ScrollView bg="$background" f={1}>
      <YStack f={1} p="$6" gap="$4" ai="center" mt="$8">
        <XStack w="100%" jc="flex-start" mb="$2">
          <Button
            size="$3.5"
            onPress={() => router.back()}
            theme="alt1"
            bg="$backgroundHover"
            br="$3"
          >
            Quay lại
          </Button>
        </XStack>

        <YStack ai="center" gap="$1" mb="$4">
          <H3 col="$color" ta="center" fow="bold">
            Đăng Ký Tham Gia
          </H3>
          <Paragraph col="$colorMuted" ta="center" fos="$3">
            Giải đấu: {tournamentId || 'Giải đấu CourtMate'}
          </Paragraph>
        </YStack>

        <RegistrationForm
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
          errorMessage={error}
        />
      </YStack>
    </ScrollView>
  );
};

export default RegistrationFormScreen;
