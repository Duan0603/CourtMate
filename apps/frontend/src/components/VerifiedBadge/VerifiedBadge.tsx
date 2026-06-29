import React from 'react';
import { XStack, SizableText } from 'tamagui';
import { BadgeCheck } from 'lucide-react-native';

interface VerifiedBadgeProps {
  isVerified: boolean;
  showText?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ isVerified, showText = false }) => {
  if (!isVerified) return null;

  return (
    <XStack ai="center" gap="$1.5">
      <BadgeCheck size={16} color="#3b82f6" fill="#bfdbfe" />
      {showText && (
        <SizableText size="$2" col="$colorMuted" fow="600">
          Tổ chức uy tín
        </SizableText>
      )}
    </XStack>
  );
};
