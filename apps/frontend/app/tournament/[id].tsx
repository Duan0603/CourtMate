import React from 'react';
import { YStack, H2, H4, Paragraph, Text, ScrollView, XStack } from 'tamagui';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, MapPin, Calendar, Users, FileText } from 'lucide-react-native';

export default function TournamentDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Determine mock title based on ID if possible to match seed data
  const isPickleball = id?.toLowerCase().includes('pickleball') || id === '64957e841234567890abcdef2';
  const title = isPickleball
    ? 'Danang Pickleball Open 2026'
    : 'Giải vô địch Cầu lông Phong trào Đà Nẵng 2026';

  const sport = isPickleball ? 'PICKLEBALL' : 'BADMINTON';
  const sportColor = isPickleball ? '#C4F82A' : '#3B82F6';
  const sportBg = isPickleball ? 'rgba(196, 248, 42, 0.1)' : 'rgba(59, 130, 246, 0.1)';
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
    <YStack bg="#0A0A0A" f={1}>
      
      {/* Header */}
      <XStack p="$5" pt="$10" ai="center" gap="$3" bg="rgba(20,20,20,0.8)" borderBottomWidth={1} borderBottomColor="rgba(255,255,255,0.05)">
        <YStack w={40} h={40} br={20} bg="rgba(255,255,255,0.1)" jc="center" ai="center" onPress={() => router.replace('/')}>
          <ChevronLeft color="white" size={24} />
        </YStack>
        <Text color="white" fow="700" fos={18}>Chi tiết giải đấu</Text>
      </XStack>

      <ScrollView f={1} p="$5" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <YStack gap="$5">
          <YStack gap="$3">
            <XStack jc="space-between" ai="center">
              <YStack px="$3" py="$1" br="$4" bg={sportBg} borderWidth={1} borderColor={sportColor}>
                <Text fos={12} fow="700" color={sportColor}>{sport}</Text>
              </YStack>
              <Text fos={12} color="rgba(255,255,255,0.5)">ID: {id?.substring(0, 8)}...</Text>
            </XStack>
            <H2 color="white" fow="900" lh={34}>{title}</H2>
          </YStack>

          {/* Info Card */}
          <YStack bg="rgba(20,20,20,0.6)" br="$6" p="$5" borderWidth={1} borderColor="rgba(255,255,255,0.08)" gap="$4">
            <XStack gap="$3" ai="flex-start">
              <MapPin color="rgba(255,255,255,0.5)" size={20} />
              <YStack f={1}>
                <Text color="rgba(255,255,255,0.5)" fos={13}>Địa điểm thi đấu</Text>
                <Text color="white" fow="600" mt="$1">{location}</Text>
              </YStack>
            </XStack>
            
            <XStack gap="$3" ai="flex-start">
              <Calendar color="rgba(255,255,255,0.5)" size={20} />
              <YStack f={1}>
                <Text color="rgba(255,255,255,0.5)" fos={13}>Thời gian tổ chức</Text>
                <Text color="white" fow="600" mt="$1">{time}</Text>
              </YStack>
            </XStack>

            <XStack gap="$3" ai="flex-start">
              <Users color="rgba(255,255,255,0.5)" size={20} />
              <YStack f={1}>
                <Text color="rgba(255,255,255,0.5)" fos={13}>Giới hạn đội tham gia</Text>
                <Text color="white" fow="600" mt="$1">{slotsLimit} cặp đấu</Text>
              </YStack>
            </XStack>
          </YStack>

          {/* Rules Section */}
          <YStack gap="$3" mt="$2">
            <XStack ai="center" gap="$2">
              <FileText color={sportColor} size={20} />
              <H4 color="white" fow="800">Điều lệ giải đấu</H4>
            </XStack>
            <Paragraph color="rgba(255,255,255,0.7)" ta="justify" fos={15} lh={24}>
              {rules}
            </Paragraph>
          </YStack>
        </YStack>
      </ScrollView>

      {/* Bottom Fixed CTA */}
      <YStack position="absolute" bottom={0} left={0} right={0} p="$5" pb="$8" bg="rgba(10,10,10,0.95)" borderTopWidth={1} borderTopColor="rgba(255,255,255,0.05)">
        <XStack jc="space-between" ai="center" mb="$3">
          <Text color="rgba(255,255,255,0.5)" fos={14}>Lệ phí tham gia:</Text>
          <Text color={sportColor} fow="900" fos={24}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fee)}
          </Text>
        </XStack>
        <YStack
          bg={sportColor}
          h={56}
          br="$4"
          jc="center"
          ai="center"
          onPress={() => router.push(`/register/${id}`)}
          pressStyle={{ scale: 0.98, opacity: 0.9 }}
          animation="quick"
        >
          <Text color="#0A0A0A" fow="900" fos={16} textTransform="uppercase">
            Đăng ký thi đấu ngay
          </Text>
        </YStack>
      </YStack>
    </YStack>
  );
}
