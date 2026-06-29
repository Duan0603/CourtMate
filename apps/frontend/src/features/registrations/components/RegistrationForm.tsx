import React, { useState } from 'react';
import { YStack, XStack, Label, Text, ThemeableStack } from 'tamagui';
import { Button, Input } from '../../../components';
import { SkillLevel, CreateRegistrationDto } from '@courtmate/shared';

interface RegistrationFormProps {
  onSubmit: (data: Omit<CreateRegistrationDto, 'tournamentId'>) => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSubmit,
  isLoading,
  errorMessage,
}) => {
  const [playerName, setPlayerName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.INTERMEDIATE);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = () => {
    setValidationError(null);

    if (!playerName.trim()) {
      setValidationError('Vui lòng nhập tên người chơi.');
      return;
    }
    if (!contactPhone.trim()) {
      setValidationError('Vui lòng nhập số điện thoại liên hệ.');
      return;
    }
    // Simple Vietnamese phone number validation
    const phoneRegex = /^0[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(contactPhone.trim())) {
      setValidationError('Số điện thoại không hợp lệ (ví dụ: 0905123456).');
      return;
    }

    onSubmit({
      playerName: playerName.trim(),
      partnerName: partnerName.trim() || undefined,
      contactPhone: contactPhone.trim(),
      skillLevel,
    });
  };

  const skillOptions = [
    { label: 'Mới chơi', value: SkillLevel.BEGINNER },
    { label: 'Trung bình', value: SkillLevel.INTERMEDIATE },
    { label: 'Nâng cao', value: SkillLevel.ADVANCED },
  ];

  return (
    <YStack gap="$4" w="100%" maxW={400} p="$4" bg="$backgroundHover" br="$6" shadowColor="$shadowColor" shadowRadius={8}>
      {validationError && (
        <Text col="$red10" fow="bold" ta="center" fos="$3">
          {validationError}
        </Text>
      )}

      {errorMessage && (
        <Text col="$red10" fow="bold" ta="center" fos="$3">
          {errorMessage}
        </Text>
      )}

      <YStack gap="$1.5">
        <Label col="$color" fow="bold" fos="$4">Họ và tên VĐV *</Label>
        <Input
          placeholder="Nhập họ và tên của bạn"
          value={playerName}
          onChangeText={setPlayerName}
          autoCapitalize="words"
        />
      </YStack>

      <YStack gap="$1.5">
        <Label col="$color" fow="bold" fos="$4">Họ và tên đồng đội (Nếu có)</Label>
        <Input
          placeholder="Nhập họ và tên đồng đội (đấu đôi)"
          value={partnerName}
          onChangeText={setPartnerName}
          autoCapitalize="words"
        />
      </YStack>

      <YStack gap="$1.5">
        <Label col="$color" fow="bold" fos="$4">Số điện thoại liên hệ *</Label>
        <Input
          placeholder="Ví dụ: 0905123456"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />
      </YStack>

      <YStack gap="$1.5">
        <Label col="$color" fow="bold" fos="$4">Trình độ của bạn *</Label>
        <XStack gap="$2" jc="space-between" w="100%">
          {skillOptions.map((opt) => {
            const isSelected = skillLevel === opt.value;
            return (
              <Button
                key={opt.value}
                f={1}
                onPress={() => setSkillLevel(opt.value)}
                theme={isSelected ? 'active' : 'alt1'}
                bg={isSelected ? '#ff5e3a' : '$backgroundHover'}
                col={isSelected ? '#ffffff' : '$color'}
                borderColor={isSelected ? '#ff5e3a' : '$borderColor'}
                borderWidth={1}
                size="$3.5"
                br="$3"
              >
                <Text fow="bold" fos="$3" col={isSelected ? '#ffffff' : '$color'}>
                  {opt.label}
                </Text>
              </Button>
            );
          })}
        </XStack>
      </YStack>

      <Button
        mt="$4"
        onPress={handleSubmit}
        disabled={isLoading}
        bg="#ff5e3a"
        col="#ffffff"
        hoverStyle={{ bg: '#e54d2a' }}
        size="$5"
        br="$4"
      >
        <Text fow="bold" col="#ffffff" fos="$4">
          {isLoading ? 'Đang gửi đăng ký...' : 'Xác nhận Đăng ký'}
        </Text>
      </Button>
    </YStack>
  );
};
