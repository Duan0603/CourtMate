import React from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, QrCode, CheckCircle2 } from 'lucide-react-native';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components';
import { useRegistrations } from '../../registrations/hooks/useRegistrations';

const MOCK_QR_URL = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';

export const PaymentScreen: React.FC = () => {
  const params = useLocalSearchParams<{ 
    tournamentId: string;
    playerName: string;
    partnerName?: string;
    contactPhone: string;
    skillLevel: string;
    paymentMethod: string;
  }>();

  const { submitRegistration, isSubmitting } = useRegistrations();
  
  // Seeded mock player ID for frontend bypass
  const mockPlayerId = '64957e841234567890abcdef';

  const handleComplete = async () => {
    try {
      await submitRegistration({
        tournamentId: params.tournamentId,
        playerName: params.playerName,
        partnerName: params.partnerName,
        contactPhone: params.contactPhone,
        skillLevel: params.skillLevel as any,
      }, mockPlayerId);

      Alert.alert(
        'Thành công', 
        'Đăng ký giải đấu thành công!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]
      );
    } catch (e) {
      console.error('Payment complete error:', e);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi hoàn tất thanh toán. Vui lòng thử lại.');
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-md pt-2xl bg-surface border-b border-outline-variant/30 space-x-md">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full border border-outline-variant/30 items-center justify-center bg-surface-container-lowest"
          onPress={() => router.back()}
        >
          <ChevronLeft color="#1d4ed8" size={24} />
        </TouchableOpacity>
        <Typography variant="headline-md" className="flex-1 text-primary font-bold">
          Thanh toán lệ phí
        </Typography>
      </View>

      <ScrollView className="flex-1 p-md" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="space-y-xl mt-md items-center">
          
          <View className="items-center space-y-sm mb-sm">
            <View className="w-16 h-16 rounded-full bg-green-success/10 justify-center items-center mb-xs">
              <QrCode color="#22C55E" size={28} />
            </View>
            <Typography variant="headline-lg" className="text-primary font-bold text-center">
              Quét mã QR
            </Typography>
            <Typography variant="body-md" className="text-on-surface-variant text-center opacity-70">
              Vui lòng sử dụng Momo hoặc ứng dụng ngân hàng để quét mã.
            </Typography>
          </View>

          <View className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant/30 w-full max-w-[320px] items-center space-y-md" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8 }}>
            <View className="w-[200px] h-[200px] bg-white p-2 border border-outline-variant/30 rounded-xl">
              <Image 
                source={{ uri: MOCK_QR_URL }} 
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            
            <View className="w-full bg-primary/5 p-sm rounded-lg border border-primary/10 mt-md">
              <Typography variant="label-sm" className="text-center opacity-70">Mã giải đấu</Typography>
              <Typography variant="headline-md" className="text-center text-primary font-bold">
                {params.tournamentId?.substring(0,8).toUpperCase()}
              </Typography>
            </View>

            <View className="w-full bg-orange-highlight/5 p-sm rounded-lg border border-orange-highlight/10 mt-sm">
              <Typography variant="label-sm" className="text-center opacity-70">Nội dung chuyển khoản</Typography>
              <Typography variant="label-md" className="text-center text-orange-highlight font-bold mt-1">
                CM {params.playerName?.replace(/\s+/g, '').toUpperCase()}
              </Typography>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Button */}
      <View className="absolute bottom-0 left-0 right-0 p-md pb-xl bg-surface border-t border-outline-variant/30">
        <Button
          onPress={handleComplete}
          disabled={isSubmitting}
          bg="#22C55E"
          color="#ffffff"
          hoverStyle={{ bg: '#16a34a' }}
          size="$5"
          br="$4"
          icon={<CheckCircle2 color="#ffffff" size={20} />}
        >
          <Typography variant="label-md" className="text-white ml-2 font-bold">
            {isSubmitting ? 'Đang xử lý...' : 'Tôi đã thanh toán (Hoàn thành)'}
          </Typography>
        </Button>
      </View>
    </View>
  );
};
