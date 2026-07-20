import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ExternalLink, ShieldCheck, WalletCards } from 'lucide-react-native';
import { useRegistrations } from '../../registrations/hooks/useRegistrations';
import { PaymentProvider, paymentsApi } from '../services/payments.api';
import { useLogin } from '../../auth/hooks/useLogin';

const NAVY = '#00102F'; const BLUE = '#0077FF'; const MUTED = '#52627A'; const BORDER = 'rgba(0,16,47,0.12)';

export const PaymentScreen: React.FC = () => {
  const params = useLocalSearchParams<{ tournamentId: string; registrationId?: string; playerName?: string; partnerName?: string; contactPhone?: string; skillLevel?: string; paymentMethod?: string }>();
  const { submitRegistration } = useRegistrations();
  const { user, token } = useLogin();
  const [provider, setProvider] = useState<PaymentProvider>(params.paymentMethod === 'PAYOS' ? 'PAYOS' : 'MOMO');
  const [registrationId, setRegistrationId] = useState<string | undefined>(params.registrationId);
  const [orderId, setOrderId] = useState<string>();
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'PAID' | 'FAILED'>('IDLE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId || status !== 'PENDING') return;
    const interval = setInterval(async () => {
      try {
        if (!token || token === 'mock_google_jwt_token') return;
        const transaction = await paymentsApi.status(orderId, token);
        if (transaction.status === 'PAID') {
          setStatus('PAID');
          clearInterval(interval);
          Alert.alert('Thanh toán thành công', 'Lượt đăng ký của bạn đã được xác nhận.', [{ text: 'Xem hồ sơ', onPress: () => router.replace('/(tabs)/profile') }]);
        } else if (transaction.status === 'FAILED' || transaction.status === 'EXPIRED') {
          setStatus('FAILED'); clearInterval(interval);
        }
      } catch { /* keep polling while checkout is open */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId, status, token]);

  const startPayment = async () => {
    setLoading(true);
    try {
      if (!token || token === 'mock_google_jwt_token') throw new Error('Vui lòng đăng nhập bằng tài khoản CourtMate trước khi thanh toán');
      const playerId = user?.id || (user as any)?._id;
      if (!playerId) throw new Error('Không xác định được người chơi');
      let resolvedRegistrationId = registrationId;
      if (!resolvedRegistrationId) {
        if (!params.playerName || !params.contactPhone || !params.skillLevel) throw new Error('Thiếu thông tin hồ sơ đăng ký');
        const registration = await submitRegistration({ tournamentId: params.tournamentId, playerName: params.playerName, partnerName: params.partnerName, contactPhone: params.contactPhone, skillLevel: params.skillLevel as any }, String(playerId));
        resolvedRegistrationId = (registration as any).id || (registration as any)._id;
        if (!resolvedRegistrationId) throw new Error('Backend không trả mã đăng ký');
        setRegistrationId(resolvedRegistrationId);
      }
      const transaction = await paymentsApi.create(resolvedRegistrationId, provider, token);
      if (!transaction.payUrl) throw new Error('Cổng thanh toán không trả URL');
      setOrderId(transaction.orderId); setStatus('PENDING');
      await Linking.openURL(transaction.payUrl);
    } catch (error: any) {
      setStatus('FAILED'); Alert.alert('Không thể thanh toán', error.message || 'Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7FAFF' }}>
      <View style={{ height: 92, paddingTop: 32, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: NAVY }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft color="#FFFFFF" size={26} /></TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '600', marginLeft: 8 }}>Thanh toán lệ phí</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}><View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: '#EAF4FF', alignItems: 'center', justifyContent: 'center' }}><WalletCards color={BLUE} size={34} /></View><Text style={{ color: NAVY, fontSize: 24, fontWeight: '600', marginTop: 16 }}>Chọn cổng thanh toán</Text><Text style={{ color: MUTED, fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 8 }}>Bạn sẽ được chuyển đến trang thanh toán bảo mật của nhà cung cấp.</Text></View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {(['MOMO', 'PAYOS'] as PaymentProvider[]).map(item => <TouchableOpacity key={item} onPress={() => setProvider(item)} style={{ flex: 1, minHeight: 72, borderRadius: 16, borderWidth: 2, borderColor: provider === item ? BLUE : BORDER, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: item === 'MOMO' ? '#A50064' : '#111827', fontSize: 18, fontWeight: '600' }}>{item === 'MOMO' ? 'MoMo' : 'VietQR'}</Text><Text style={{ color: MUTED, fontSize: 13, marginTop: 3 }}>{item === 'MOMO' ? 'Ví điện tử' : 'Chuyển khoản'}</Text></TouchableOpacity>)}
        </View>
        <View style={{ marginTop: 20, backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: BORDER }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><ShieldCheck color="#22C55E" size={22} /><Text style={{ color: NAVY, fontSize: 16, fontWeight: '600', marginLeft: 8 }}>Xác nhận qua callback bảo mật</Text></View><Text style={{ color: MUTED, fontSize: 14, lineHeight: 20, marginTop: 8 }}>CourtMate chỉ ghi nhận đã thanh toán sau khi chữ ký và số tiền được cổng thanh toán xác minh.</Text></View>
        {status === 'PENDING' && <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={BLUE} /><Text style={{ color: MUTED, marginLeft: 8 }}>Đang chờ kết quả thanh toán…</Text></View>}
      </ScrollView>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 28, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: BORDER }}><TouchableOpacity disabled={loading || status === 'PENDING'} onPress={startPayment} style={{ height: 52, borderRadius: 14, backgroundColor: loading || status === 'PENDING' ? '#A9BDD7' : BLUE, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <><Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Thanh toán với {provider === 'MOMO' ? 'MoMo' : 'VietQR'}</Text><ExternalLink color="#FFFFFF" size={19} style={{ marginLeft: 8 }} /></>}</TouchableOpacity></View>
    </View>
  );
};
