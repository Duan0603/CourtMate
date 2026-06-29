import React from 'react';
import { YStack, XStack, Text, Paragraph } from 'tamagui';
import { Button } from '../../../components';
import { Registration, RegistrationStatus, SkillLevel } from '@courtmate/shared';

interface RegistrationStatusCardProps {
  registration: Registration;
  onSimulatePayment: (id: string) => void;
}

export const RegistrationStatusCard: React.FC<RegistrationStatusCardProps> = ({
  registration,
  onSimulatePayment,
}) => {
  // Safe extraction of MongoDB ID or standard ID property
  const registrationId = registration.id || (registration as any)._id;

  const getStatusDetails = (status: RegistrationStatus) => {
    switch (status) {
      case RegistrationStatus.PENDING:
        return { label: 'Chờ duyệt', color: '#ffb300', bg: 'rgba(255, 179, 0, 0.1)' };
      case RegistrationStatus.APPROVED:
        return { label: 'Đã duyệt (Chờ thanh toán)', color: '#0288d1', bg: 'rgba(2, 136, 209, 0.1)' };
      case RegistrationStatus.PAID:
        return { label: 'Đã thanh toán', color: '#4caf50', bg: 'rgba(76, 175, 80, 0.1)' };
      case RegistrationStatus.REJECTED:
        return { label: 'Từ chối', color: '#f44336', bg: 'rgba(244, 67, 54, 0.1)' };
      default:
        return { label: status, color: '#9e9e9e', bg: 'rgba(158, 158, 158, 0.1)' };
    }
  };

  const getSkillLabel = (level: SkillLevel) => {
    switch (level) {
      case SkillLevel.BEGINNER:
        return 'Mới chơi';
      case SkillLevel.INTERMEDIATE:
        return 'Trung bình';
      case SkillLevel.ADVANCED:
        return 'Nâng cao';
      default:
        return level;
    }
  };

  const statusInfo = getStatusDetails(registration.status);

  return (
    <YStack
      p="$4"
      bg="$backgroundHover"
      br="$4"
      borderWidth={1}
      borderColor="$borderColor"
      gap="$3"
      w="100%"
      shadowColor="$shadowColor"
      shadowRadius={4}
    >
      <XStack jc="space-between" ai="center">
        <YStack f={1} mr="$2">
          <Text fow="bold" fos="$4" col="$color" numberOfLines={1}>
            ID Giải: {registration.tournamentId}
          </Text>
          <Text fos="$2" col="$colorMuted">
            Đăng ký ngày: {new Date(registration.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </YStack>
        <XStack
          px="$3"
          py="$1"
          br="$10"
          bg={statusInfo.bg}
          borderColor={statusInfo.color}
          borderWidth={1}
        >
          <Text fos="$2" fow="bold" col={statusInfo.color}>
            {statusInfo.label}
          </Text>
        </XStack>
      </XStack>

      <YStack gap="$1">
        <Paragraph col="$color" fos="$3">
          <Text fow="bold">VĐV:</Text> {registration.playerName}
        </Paragraph>
        {registration.partnerName && (
          <Paragraph col="$color" fos="$3">
            <Text fow="bold">Đồng đội:</Text> {registration.partnerName}
          </Paragraph>
        )}
        <Paragraph col="$color" fos="$3">
          <Text fow="bold">Liên hệ:</Text> {registration.contactPhone}
        </Paragraph>
        <XStack gap="$2" ai="center" mt="$1">
          <Text fos="$2.5" col="$colorMuted">
            Trình độ:
          </Text>
          <XStack px="$2.5" py="$0.5" br="$3" bg="$background" borderWidth={1} borderColor="$borderColor">
            <Text fos="$2" fow="bold" col="$color">
              {getSkillLabel(registration.skillLevel)}
            </Text>
          </XStack>
        </XStack>
      </YStack>

      {/* Mock status transitions: allow paying if pending or approved to simulate flow */}
      {registration.status !== RegistrationStatus.PAID && registration.status !== RegistrationStatus.REJECTED && (
        <XStack mt="$2">
          <Button
            f={1}
            size="$3"
            br="$3"
            bg="#4caf50"
            col="#ffffff"
            hoverStyle={{ bg: '#388e3c' }}
            onPress={() => onSimulatePayment(registrationId)}
          >
            <Text fow="bold" col="#ffffff" fos="$2.5">
              Giả lập Thanh toán (VND)
            </Text>
          </Button>
        </XStack>
      )}
    </YStack>
  );
};
