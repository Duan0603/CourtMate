import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react-native';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { tournamentsApi } from '../../tournaments/services/tournaments.api';
import { Tournament } from '@courtmate/shared';

const MOCK_QR_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

export const TicketScreen: React.FC = () => {
  const { tournamentId } = useLocalSearchParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (tournamentId) {
      tournamentsApi.getTournamentDetails(tournamentId)
        .then(setTournament)
        .catch(console.error);
    }
  }, [tournamentId]);

  return (
    <View className="flex-1 bg-[#F1F5F9]">
      {/* Header */}
      <View className="flex-row items-center p-md pt-2xl bg-white border-b border-gray-border space-x-md">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full border border-gray-border items-center justify-center bg-white"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#0F172A" size={24} />
        </TouchableOpacity>
        <Typography variant="headline-md" color="navy" className="flex-1">
          Vé điện tử
        </Typography>
      </View>

      <ScrollView className="flex-1 p-md" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60, alignItems: 'center' }}>
        
        {/* Ticket Container */}
        <View className="w-full max-w-[340px] mt-lg">
          
          {/* Top Section */}
          <View className="bg-white rounded-t-[24px] p-lg items-center" style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
            <View className="w-16 h-16 rounded-full bg-orange-highlight/10 items-center justify-center mb-sm">
              <TicketIcon color="#F97316" size={32} />
            </View>
            <Typography variant="headline-lg-mobile" color="navy" align="center" className="mb-xs">
              {tournament?.title || 'Giải đấu CourtMate'}
            </Typography>
            <Typography variant="body-md" color="navy" className="opacity-60 mb-md text-center">
              Mã vé: {tournamentId?.substring(0,8).toUpperCase()}-{(Math.random() * 10000).toFixed(0)}
            </Typography>

            <View className="w-[200px] h-[200px] mb-md p-2 border border-gray-border rounded-xl">
              <Image 
                source={{ uri: MOCK_QR_URL }} 
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            <Typography variant="label-md" className="text-orange-highlight fow-bold">ĐÃ THANH TOÁN</Typography>
          </View>

          {/* Divider with Cutouts */}
          <View className="flex-row items-center relative h-6 bg-transparent z-10" style={{ marginTop: -12, marginBottom: -12 }}>
            <View className="w-6 h-6 rounded-full bg-[#F1F5F9] absolute -left-3" />
            <View className="flex-1 h-[2px] mx-4 overflow-hidden">
              <View className="w-full h-full border-t-2 border-dashed border-gray-connector" />
            </View>
            <View className="w-6 h-6 rounded-full bg-[#F1F5F9] absolute -right-3" />
          </View>

          {/* Bottom Section */}
          <View className="bg-white rounded-b-[24px] p-lg space-y-md" style={{ elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }}>
            <View className="flex-row items-center space-x-sm">
              <Calendar color="#64748B" size={20} />
              <View>
                <Typography variant="label-sm" className="text-slate-500">Thời gian</Typography>
                <Typography variant="body-md" color="navy" className="fow-bold">
                  {tournament?.startDate ? new Date(tournament.startDate).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                </Typography>
              </View>
            </View>
            
            <View className="flex-row items-center space-x-sm mt-md">
              <MapPin color="#64748B" size={20} />
              <View className="flex-1">
                <Typography variant="label-sm" className="text-slate-500">Địa điểm</Typography>
                <Typography variant="body-md" color="navy" className="fow-bold">
                  {tournament?.location || 'Đang cập nhật'}
                </Typography>
              </View>
            </View>
            
            <View className="flex-row items-center space-x-sm mt-md pt-md border-t border-gray-border">
              <View className="flex-1">
                <Typography variant="label-sm" className="text-slate-500">Tên người chơi</Typography>
                <Typography variant="body-md" color="navy" className="fow-bold">Người chơi</Typography>
              </View>
              <View className="flex-1 items-end">
                <Typography variant="label-sm" className="text-slate-500">Số lượng</Typography>
                <Typography variant="body-md" color="navy" className="fow-bold">1 Vận động viên</Typography>
              </View>
            </View>
          </View>
          
        </View>

        <Typography variant="label-sm" className="text-slate-400 mt-xl text-center">
          Vui lòng đưa mã QR này cho ban tổ chức khi đến check-in.
        </Typography>

      </ScrollView>
    </View>
  );
};
