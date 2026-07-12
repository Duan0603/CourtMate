import React from 'react';
import { YStack, XStack, H2, H4, Paragraph, Text, ScrollView } from 'tamagui';
import { Calendar, CheckCircle2, Clock } from 'lucide-react-native';

const mockHistory = [
  {
    id: '1',
    title: 'Danang Pickleball Open 2026',
    sport: 'PICKLEBALL',
    date: '2026-08-15',
    status: 'Đã xác nhận',
    color: '#059669',
  },
  {
    id: '2',
    title: 'Giải vô địch Cầu lông Phong trào',
    sport: 'BADMINTON',
    date: '2026-07-20',
    status: 'Hoàn thành',
    color: '#476F62',
  }
];

export default function TrackerTab() {
  return (
    <YStack f={1} bg="#F4FBF7">
      {/* Header */}
      <YStack p="$5" pt="$8" bg="#FFFFFF" borderBottomWidth={1} borderBottomColor="rgba(5, 150, 105, 0.08)">
        <Paragraph color="#059669" fos={12} tt="uppercase" fow="700" ls={1}>
          Lịch sử của bạn
        </Paragraph>
        <H2 color="#062F21" fow="800">Hồ sơ tham gia</H2>
      </YStack>

      <ScrollView f={1} p="$5">
        <YStack gap="$4" pb="$8">
          
          <XStack jc="space-between" mb="$2">
            <YStack f={1} bg="rgba(5, 150, 105, 0.04)" br="$4" p="$3" mr="$2" ai="center" borderWidth={1} borderColor="rgba(5, 150, 105, 0.08)">
              <Text color="#059669" fos={24} fow="800">12</Text>
              <Text color="#476F62" fos={12}>Giải đấu</Text>
            </YStack>
            <YStack f={1} bg="rgba(37, 99, 235, 0.04)" br="$4" p="$3" ml="$2" ai="center" borderWidth={1} borderColor="rgba(37, 99, 235, 0.08)">
              <Text color="#2563EB" fos={24} fow="800">45</Text>
              <Text color="#476F62" fos={12}>Giờ chơi</Text>
            </YStack>
          </XStack>

          <Text color="#062F21" fos={18} fow="700" mt="$4" mb="$2">Hoạt động gần đây</Text>

          {mockHistory.map((item) => (
            <YStack
              key={item.id}
              bg="#FFFFFF"
              br={12}
              p="$4"
              borderWidth={1}
              borderColor="rgba(5, 150, 105, 0.08)"
              shadowColor="rgba(5, 150, 105, 0.06)"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={1}
              shadowRadius={8}
              elevation={1}
            >
              <XStack jc="space-between" ai="center" mb="$2">
                <XStack bg="rgba(5, 150, 105, 0.06)" px="$3" py="$1" br="$4">
                  <Text color="#059669" fos={12} fow="700">{item.sport}</Text>
                </XStack>
                <XStack ai="center" gap="$1.5">
                  {item.status === 'Hoàn thành' ? (
                    <CheckCircle2 color="#476F62" size={14} />
                  ) : (
                    <Clock color="#D97706" size={14} />
                  )}
                  <Text color={item.status === 'Hoàn thành' ? '#476F62' : '#D97706'} fos={12} fow="600">{item.status}</Text>
                </XStack>
              </XStack>
              <H4 color="#062F21" fow="700" mb="$2">{item.title}</H4>
              <XStack ai="center" gap="$2">
                <Calendar color="#476F62" size={14} />
                <Text color="#476F62" fos={14}>{item.date}</Text>
              </XStack>
            </YStack>
          ))}

        </YStack>
      </ScrollView>
    </YStack>
  );
}
