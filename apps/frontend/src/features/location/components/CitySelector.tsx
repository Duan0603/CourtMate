import React from 'react';
import { YStack, XStack, Button, H3, Paragraph } from 'tamagui';
import { REGION_CONFIGS, SupportedCity } from '@courtmate/shared';

interface CitySelectorProps {
  selectedCity: SupportedCity | null;
  onSelectCity: (city: SupportedCity) => void;
}

/**
 * City selector component for manual city selection.
 * Displayed when no city preference is saved or when user wants to switch cities.
 */
export const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCity,
  onSelectCity,
}) => {
  const activeRegions = REGION_CONFIGS.filter((r) => r.isActive);

  return (
    <YStack gap="$3" p="$4">
      <H3 col="$color" ta="center">
        Chọn khu vực của bạn
      </H3>
      <Paragraph col="$colorMuted" ta="center" fos="$3">
        Hiển thị giải đấu phù hợp với vị trí của bạn
      </Paragraph>
      <YStack gap="$2" mt="$2">
        {activeRegions.map((region) => (
          <Button
            key={region.city}
            size="$5"
            br="$4"
            theme={selectedCity === region.city ? 'active' : undefined}
            onPress={() => onSelectCity(region.city)}
            pressStyle={{ scale: 0.97, opacity: 0.85 }}
            animation="quick"
          >
            {region.displayName}
          </Button>
        ))}
      </YStack>
    </YStack>
  );
};

export default CitySelector;
