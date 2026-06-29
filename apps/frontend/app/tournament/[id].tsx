import React from 'react';
import { YStack, H2, H4, Paragraph, Text, ScrollView, XStack } from 'tamagui';
import { useLocalSearchParams, router } from 'expo-router';
import { Button } from '../../src/components';
import { formatCurrency } from '../../src/utils/validation';

export default function TournamentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Determine mock title based on ID if possible to match seed data
  const isPickleball = id?.toLowerCase().includes('pickleball') || id === '64957e841234567890abcdef2';
  const title = isPickleball
    ? 'Danang Pickleball Open 2026'
    : 'Giải vô địch Cầu lông Phong trào Đà Nẵng 2026';

  const sport = isPickleball ? 'PICKLEBALL' : 'BADMINTON';
  const fee = isPickleball ? 150000 : 200000;
  const slotsLimit = isPickleball ? 24 : 32;
  const location = isPickleball
    ? 'Sân Pickleball Sơn Trà, Đà Nẵng'
    : 'Nhà thi đấu Thể dục Thể thao Đà Nẵng, Phan Đăng Lưu';
  const time = isPickleball ? '30/08/2026' : '15/07/2026 - 18/07/2026';
  const rules = isPickleball
    ? 'Thi đấu đôi nam, đôi nữ và đôi nam nữ phối hợp. Luật thi đấu áp dụng luật Pickleball quốc tế.'
    : 'Thi đấu theo luật Cầu lông hiện hành của Tổng cục TDTT. Đăng ký theo cặp đấu đôi nam hoặc đôi nam nữ.';

  return (
    <YStack bg="$background" f={1} p="$5" mt="$8" gap="$4">
      <XStack w="100%" jc="flex-start">
        <Button
          size="$3.5"
          onPress={() => router.replace('/')}
          theme="alt1"
          bg="$backgroundHover"
          br="$3"
        >
          Quay lại
        </Button>
      </XStack>

      <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <YStack gap="$4">
          <YStack gap="$1">
            <XStack gap="$2" ai="center">
              <Text fow="bold" fos="$2.5" col="#ff5e3a" bg="rgba(255, 94, 58, 0.1)" px="$2.5" py="$0.5" br="$3">
                {sport}
              </Text>
              <Text fos="$2.5" col="$colorMuted">
                ID: {id}
              </Text>
            </XStack>
            <H2 col="$color" fow="bold" mt="$1.5">
              {title}
            </H2>
          </YStack>

          <YStack bg="$backgroundHover" p="$4" br="$4" gap="$2.5" borderWidth={1} borderColor="$borderColor">
            <XStack jc="space-between">
              <Text col="$colorMuted">Lệ phí:</Text>
              <Text col="$color" fow="bold">{formatCurrency(fee)}</Text>
            </XStack>
            <XStack jc="space-between">
              <Text col="$colorMuted">Thời gian:</Text>
              <Text col="$color" fow="bold">{time}</Text>
            </XStack>
            <XStack jc="space-between">
              <Text col="$colorMuted">Địa điểm:</Text>
              <Text col="$color" fow="bold" f={1} ta="right" ml="$4" numberOfLines={2}>
                {location}
              </Text>
            </XStack>
            <XStack jc="space-between">
              <Text col="$colorMuted">Giới hạn slots:</Text>
              <Text col="$color" fow="bold">{slotsLimit} cặp đấu</Text>
            </XStack>
          </YStack>

          <YStack gap="$2">
            <H4 col="$color" fow="bold">Điều lệ giải đấu</H4>
            <Paragraph col="$colorMuted" ta="justify" fos="$3.5" lh="$5">
              {rules}
            </Paragraph>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Large CTA single-hand touch target placed in thumb zone near bottom */}
      <YStack position="absolute" bottom="$4" left="$5" right="$5" bg="$background" pt="$2">
        <Button
          bg="#ff5e3a"
          col="#ffffff"
          hoverStyle={{ bg: '#e54d2a' }}
          size="$5"
          br="$4"
          onPress={() => router.push(`/register/${id}`)}
        >
          <Text fow="bold" col="#ffffff" fos="$4">
            Đăng Ký Thi Đấu Ngay
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}
