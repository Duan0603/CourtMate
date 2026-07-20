import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { XCircle } from 'lucide-react-native';

export default function PaymentCancelRoute() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFEBEB', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
        <XCircle color="#E8483B" size={48} />
      </View>
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
