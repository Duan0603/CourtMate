import React from 'react';
import { View, ScrollView } from 'react-native';
import { Calendar, CheckCircle2, Clock } from 'lucide-react-native';
import { Typography } from '../../src/components/ui/Typography';
import { Card } from '../../src/components/ui/Card';
import { Badge } from '../../src/components/ui/Badge';

const mockHistory = [
  {
    id: '1',
    title: 'Danang Pickleball Open 2026',
    sport: 'PICKLEBALL',
    date: '2026-08-15',
    status: 'Đã xác nhận',
  },
  {
    id: '2',
    title: 'Giải vô địch Cầu lông Phong trào',
    sport: 'BADMINTON',
    date: '2026-07-20',
    status: 'Hoàn thành',
  }
];

export default function TrackerTab() {
  return (
    <View className="flex-1 bg-surface">
      {/* Header */}
      <View className="p-lg pt-2xl bg-surface-card border-b border-gray-border">
        <Typography variant="label-sm" color="blue" className="uppercase tracking-widest mb-1">
          Lịch sử của bạn
        </Typography>
        <Typography variant="headline-lg" color="navy">
          Hồ sơ tham gia
        </Typography>
      </View>

      <ScrollView className="flex-1 p-md">
        <View className="pb-2xl space-y-md">
          
          <View className="flex-row justify-between mb-sm space-x-md">
            <View className="flex-1 bg-green-success/10 rounded-lg p-md items-center border border-green-success/20">
              <Typography variant="headline-lg" color="green">12</Typography>
              <Typography variant="label-sm" color="navy" className="mt-1">Giải đấu</Typography>
            </View>
            <View className="flex-1 bg-blue-vibrant/10 rounded-lg p-md items-center border border-blue-vibrant/20">
              <Typography variant="headline-lg" color="blue">45</Typography>
              <Typography variant="label-sm" color="navy" className="mt-1">Giờ chơi</Typography>
            </View>
          </View>

          <Typography variant="headline-md" color="navy" className="mt-md mb-sm">
            Hoạt động gần đây
          </Typography>

          <View className="space-y-sm">
            {mockHistory.map((item) => (
              <Card key={item.id} padding="md" className="mb-sm">
                <View className="flex-row justify-between items-center mb-sm">
                  <Badge label={item.sport} variant="primary" />
                  <View className="flex-row items-center space-x-1">
                    {item.status === 'Hoàn thành' ? (
                      <CheckCircle2 color="#22C55E" size={14} />
                    ) : (
                      <Clock color="#F97316" size={14} />
                    )}
                    <Typography 
                      variant="label-sm" 
                      color={item.status === 'Hoàn thành' ? 'green' : 'orange'}
                      className="ml-1"
                    >
                      {item.status}
                    </Typography>
                  </View>
                </View>
                <Typography variant="headline-md" color="navy" className="mb-xs">
                  {item.title}
                </Typography>
                <View className="flex-row items-center space-x-2 mt-xs">
                  <Calendar color="#76777D" size={14} />
                  <Typography variant="body-md" color="navy" className="opacity-70 ml-1">
                    {item.date}
                  </Typography>
                </View>
              </Card>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
