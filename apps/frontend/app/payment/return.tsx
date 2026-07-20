import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentReturnRoute() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // PayOS return query might contain `code`, `id`, `cancel`, `status`, `orderCode`
  const isCancel = params.cancel === 'true' || params.code === '1'; 

  if (isCancel) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7FAFF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#00102F', marginBottom: 8, textAlign: 'center' }}>Thanh toán đã huỷ</Text>
        <Text style={{ fontSize: 16, color: '#52627A', textAlign: 'center', marginBottom: 32 }}>
          Giao dịch chưa được hoàn tất. Bạn có thể thử lại sau.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)/home')}
          style={{ width: '100%', height: 52, borderRadius: 14, backgroundColor: '#0077FF', alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <CheckCircle2 color="#22C55E" size={48} />
      </View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#00102F', marginBottom: 8, textAlign: 'center' }}>Thanh toán thành công!</Text>
      <Text style={{ fontSize: 16, color: '#52627A', textAlign: 'center', marginBottom: 32 }}>
        Hồ sơ đăng ký của bạn đã được xác nhận. Chúc bạn thi đấu thật tốt!
      </Text>
      
      <TouchableOpacity
        onPress={() => router.replace('/(tabs)/profile')}
        style={{ width: '100%', height: 52, borderRadius: 14, backgroundColor: '#0077FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Xem hồ sơ</Text>
        <ChevronRight color="#FFFFFF" size={20} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </View>
  );
}
