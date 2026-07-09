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
    color: '#C4F82A',
  },
  {
    id: '2',
    title: 'Giải vô địch Cầu lông Phong trào',
    sport: 'BADMINTON',
    date: '2026-07-20',
    status: 'Hoàn thành',
    color: '#3B82F6',
  }
];

export default function TrackerTab() {
  return (
    <YStack f={1} bg="#0A0A0A">
      {/* Header */}
      <YStack p="$5" pt="$8" bg="rgba(20,20,20,0.8)" borderBottomWidth={1} borderBottomColor="rgba(255,255,255,0.05)">
        <Paragraph color="#C4F82A" fos={12} tt="uppercase" fow="700" ls={1}>
          Lịch sử của bạn
        </Paragraph>
        <H2 color="white" fow="800">Hồ sơ tham gia</H2>
      </YStack>

      <ScrollView f={1} p="$5">
        <YStack gap="$4" pb="$8">
          
          <XStack jc="space-between" mb="$2">
            <YStack f={1} bg="rgba(20,20,20,0.6)" br="$4" p="$3" mr="$2" ai="center" borderWidth={1} borderColor="rgba(255,255,255,0.05)">
              <Text color="#C4F82A" fos={24} fow="800">12</Text>
              <Text color="rgba(255,255,255,0.6)" fos={12}>Giải đấu</Text>
            </YStack>
            <YStack f={1} bg="rgba(20,20,20,0.6)" br="$4" p="$3" ml="$2" ai="center" borderWidth={1} borderColor="rgba(255,255,255,0.05)">
              <Text color="#3B82F6" fos={24} fow="800">45</Text>
              <Text color="rgba(255,255,255,0.6)" fos={12}>Giờ chơi</Text>
            </YStack>
          </XStack>

          <Text color="white" fos={18} fow="700" mt="$4" mb="$2">Hoạt động gần đây</Text>

          {mockHistory.map((item) => (
            <YStack
              key={item.id}
              bg="rgba(20,20,20,0.6)"
              br="$6"
              p="$4"
              borderWidth={1}
              borderColor="rgba(255,255,255,0.08)"
            >
              <XStack jc="space-between" ai="center" mb="$2">
                <XStack bg={`rgba(${item.color === '#C4F82A' ? '196,248,42' : '59,130,246'}, 0.1)`} px="$3" py="$1" br="$4">
                  <Text color={item.color} fos={12} fow="700">{item.sport}</Text>
                </XStack>
                <XStack ai="center" gap="$1.5">
                  {item.status === 'Hoàn thành' ? (
                    <CheckCircle2 color="#A1A1AA" size={14} />
                  ) : (
                    <Clock color="#C4F82A" size={14} />
                  )}
                  <Text color={item.status === 'Hoàn thành' ? '#A1A1AA' : '#C4F82A'} fos={12} fow="600">{item.status}</Text>
                </XStack>
              </XStack>
              <H4 color="white" fow="700" mb="$2">{item.title}</H4>
              <XStack ai="center" gap="$2">
                <Calendar color="rgba(255,255,255,0.5)" size={14} />
                <Text color="rgba(255,255,255,0.5)" fos={14}>{item.date}</Text>
              </XStack>
            </YStack>
          ))}

        </YStack>
      </ScrollView>
    </YStack>
  );
}
