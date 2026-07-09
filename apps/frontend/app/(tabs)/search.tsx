import React from 'react';
import { YStack, H2, Paragraph } from 'tamagui';
import { Search } from 'lucide-react-native';

export default function SearchTab() {
  return (
    <YStack f={1} bg="#0A0A0A" ai="center" jc="center" p="$5">
      <YStack w={80} h={80} br={40} bg="rgba(255,255,255,0.05)" jc="center" ai="center" mb="$4">
        <Search color="rgba(255,255,255,0.5)" size={40} />
      </YStack>
      <H2 color="white" fow="800" ta="center">Tìm kiếm Giải đấu</H2>
      <Paragraph color="rgba(255,255,255,0.6)" ta="center" mt="$2">
        Tính năng tìm kiếm đang được phát triển. Vui lòng quay lại sau!
      </Paragraph>
    </YStack>
  );
}
